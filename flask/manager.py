'''ScoreBox Cross Country Manager'''
import time
import csv
import json
from io import StringIO
from operator import itemgetter
from threading import Thread

import websock

# COLORS = {
#     'red': 'CC0000',
#     'orange': 'CC6E00',
#     'yellow': 'C8C81A',
#     'green': '09CF64',
#     'blue': '097ACF',
#     'purple': '9309CF',
#     'gold': 'B79835',
#     'silver': 'A6A6A6'
# }

def process_csv(csv_string: str):
    runners = []
    lines = csv_string.split('\r\n')

    title = lines[3].split(',')[2]
    tag = lines[4].split(',')[2]

    split_labels = lines[6].split(',')[3:]
    split_labels = list(filter(lambda x: x != '', split_labels))
    split_template = len(split_labels) * [0]

    team_colors = {}
    last_team = None
    for entry in lines[9].split(',')[3:]:
        if last_team is None:
            if entry == '':
                break
            last_team = entry
        else:
            team_colors[last_team] = entry
            last_team = None
    heats = set()
    for i, line in enumerate(lines[13:]):
        fields = line.split(',')
        heats.add(int(fields[3]))
        runner = {
            'runner_index': i,
            'jersey': fields[0],
            'name': fields[2],
            'team': fields[1],
            'color': team_colors[fields[1]],
            'heat': int(fields[3]),
            'start': 0,
            'splits': split_template.copy(),
            'finish': 0
        }
        runners.append(runner)
    return title, tag, list(range(1, len(heats) + 1)), split_labels, team_colors, runners

def format_time(milliseconds):
    rounded = round(milliseconds / 1000, 1)
    string_time, decimal = str(rounded).split('.')
    pretty_time = time.strftime('%M:%S', time.gmtime(int(string_time)))
    if pretty_time[0] == '0':
        pretty_time = pretty_time[1:]
        if pretty_time[0] == '0':
            pretty_time = pretty_time[2:]
    return f'{pretty_time}.{decimal}'

def format_time_estimate(milliseconds):
    rounded = round(milliseconds / 1000, 1)
    string_time, _ = str(rounded).split('.')
    pretty_time = time.strftime('%M:%S', time.gmtime(int(string_time)))
    if pretty_time[0] == '0':
        pretty_time = pretty_time[1:]
    return f'{pretty_time}'

class CrossCountryManager:
    
    def __init__(self, csv, socketio):
        self.title, self.tag, self.heats, self.split_labels, self.team_colors, self.runners = process_csv(csv)
        self.overlay = Overlay(self.title, self.tag, self)
        self.socketio = socketio

        self.start = 0

        self.splits = len(self.split_labels) * [None]
        self.unknowns = {'splits': [[] for _ in range(len(self.split_labels))], 'finish':[]}
        self.finish = None

        self.visibility = {
            'clock': True,
            'placement': True,
            'on_new': True,
            'lower_third': False
        }

        self.lower_third = {
            'title': '',
            'subtitle': '',
            'lower_third_mode': 'one_liner'
        }

        self.newist_split = -1

        self.heat_object = {
            'started': [],
            'next': 1,
            'future': self.heats.copy()
        }

    def start_event(self, timestamp, heat):
        if heat == 1:
            self.start = timestamp
            self.overlay.start_clock(self.start)
        for i in range(len(self.runners)):
            if self.runners[i]['heat'] == heat:
                self.runners[i]['start'] = timestamp
        
        self.heat_object['started'].append(heat)
        self.heat_object['future'].remove(heat)
        if heat + 1 in self.heats:
            self.heat_object['next'] = heat + 1
        else:
            self.heat_object['next'] = 0
    
    def update_newist_split(self, split_index):
        if self.newist_split < split_index:
            self.newist_split = split_index
            if self.visibility['on_new']:
                self.update_visibility('placement', True)
                self.socketio.emit('visibility-update', {'state': self.visibility['placement'], 'key': 'placement'}, namespace='/admin')
    
    def split(self, split_index: int, runner_index: int, timestamp):
        self.runners[runner_index]['splits'][split_index] = timestamp
        self.splits[split_index] = self.get_results(split_index)

        self.update_newist_split(split_index)

        self.overlay.push_json(self.export_placements())

    def split_unknown(self, split_index: int, timestamp: int):
        unknown = {
            'unknown_index': len(self.unknowns['splits'][split_index]),
            'jersey': '',
            'name': '',
            'team': '',
            'color': '',
            'heat': 1,
            'start': self.start,
            'split': timestamp
        }
        self.unknowns['splits'][split_index].append(unknown)

        self.splits[split_index] = self.get_results(split_index)
        self.update_newist_split(split_index)
        self.overlay.push_json(self.export_placements())

    def finish_unknown(self, timestamp: int):
        unknown = {
            'unknown_index': len(self.unknowns['finish']),
            'jersey': '',
            'name': '',
            'team': '',
            'color': '',
            'heat': 1,
            'start': self.start,
            'split': timestamp
        }
        self.unknowns['finish'].append(unknown)

        self.finish = self.get_finish_results()
        self.update_newist_split(100)
        self.overlay.push_json(self.export_placements())

    def finish_runner(self, runner_index: int, timestamp):
        self.runners[runner_index]['finish'] = timestamp
        self.finish = self.get_finish_results()

        self.update_newist_split(100)

        self.overlay.push_json(self.export_placements())

    def change_result(self, jersey, initial, timestamp, split):
        if split == 'finish':
            if initial == 'unknown':
                self.remove_finish_unknown(timestamp)
            else:
                self.remove_finish(int(initial))
            
            if jersey != '':
                self.finish_runner(self.get_runner_from_jersey(int(jersey)), timestamp)
            else:
                self.finish_unknown(timestamp)
        else:
            split = int(split)
            if initial == 'unknown':
                self.remove_split_unknown(split, timestamp)
            else:
                self.remove_split(int(initial), split)
            
            if jersey != '':
                self.split(split, self.get_runner_from_jersey(int(jersey)), timestamp)
            else:
                self.split_unknown(split, timestamp)

    def get_runner_from_jersey(self, jersey: int):
        for runner in self.runners:
            if int(runner['jersey']) == jersey:
                return int(runner['runner_index'])
    
    def remove_split(self, runner_index, split):
        self.runners[runner_index]['splits'][split] = 0
    
    def remove_split_unknown(self, split, timestamp):
        for i in range(len(self.unknowns['splits'][split])):
            if self.unknowns['splits'][split][i]['split'] == timestamp:
                self.unknowns['splits'][split].pop(i)
                return
    
    def remove_finish(self, runner_index):
        self.runners[runner_index]['finish'] = 0
    
    def remove_finish_unknown(self, timestamp):
        for i in range(len(self.unknowns['finish'])):
            if self.unknowns['finish'][i]['split'] == timestamp:
                self.unknowns['finish'].pop(i)
                return

    def get_results(self, key: int):
        candidates = []
        for runner in self.runners:
            if runner['splits'][key] > 0:
                placement = {
                    'name': runner['name'],
                    'jersey': runner['jersey'],
                    'team': runner['team'],
                    'color': runner['color'],
                    'raw_split': runner['splits'][key] - runner['start'],
                }
                candidates.append(placement)
        
        for unknown in self.unknowns['splits'][key]:
            placement = {
                'name': unknown['name'],
                'jersey': unknown['jersey'],
                'team': unknown['team'],
                'color': unknown['color'],
                'raw_split': unknown['split'] - unknown['start'],
            }
            candidates.append(placement)

        placements = sorted(candidates, key=itemgetter('raw_split'))

        return self.format_placements(placements)

    def get_finish_results(self):
        candidates = []
        for runner in self.runners:
            if runner['finish'] > 0:
                placement = {
                    'name': runner['name'],
                    'jersey': runner['jersey'],
                    'team': runner['team'],
                    'color': runner['color'],
                    'raw_split': runner['finish'] - runner['start'],
                }
                candidates.append(placement)
        
        for unknown in self.unknowns['finish']:
            placement = {
                'name': unknown['name'],
                'jersey': unknown['jersey'],
                'team': unknown['team'],
                'color': unknown['color'],
                'raw_split': unknown['split'] - unknown['start'],
            }
            candidates.append(placement)
        
        placements = sorted(candidates, key=itemgetter('raw_split'))

        return self.format_finish_placements(placements)

    def format_placements(self, placements):
        formatted = []
        leader = None
        for i, runner in enumerate(placements):
            placement = runner
            placement['place'] = i + 1
            if i == 0:
                leader = runner['raw_split']
                placement['display'] = format_time(runner['raw_split'])
            else:
                placement['display'] = "+" + format_time(runner['raw_split'] - leader)

            formatted.append(placement)
        
        return formatted
    
    def format_finish_placements(self, placements):
        formatted = []
        for i, runner in enumerate(placements):
            placement = runner
            placement['place'] = i + 1
            placement['display'] = format_time(runner['raw_split'])
            formatted.append(placement)
        
        return formatted

    def get_event_object(self):
        return {
            'start': self.start,
            'runners': self.runners,
            'heats': self.heat_object,
            'unknowns': self.unknowns
        }
    
    def export_placements(self):
        placements = None
        export = {'mode': 'placement'}
        if self.finish:
            placements = self.finish
            export.update({'heading': 'Finish'})
        else:
            placements = None
            for i in range(1, len(self.splits) + 1):
                if self.splits[-1 * i]:
                    placements =  self.splits[-1 * i]
                    export.update({'heading': self.split_labels[-1 * i]})
                    break
            if not placements:
                return
        max_entries = 12
        fixed = 5
        placements = placements[:fixed] + placements[fixed:][(-1 * (max_entries - fixed)):]
        for i in range(max_entries):
            if i <= len(placements) - 1:
                runner = {
                    f'{i}place': placements[i]['place'],
                    f'{i}team':placements[i]['team'],
                    f'{i}color':placements[i]['color'],
                    f'{i}jersey':placements[i]['jersey'],
                    f'{i}name':placements[i]['name'],
                    f'{i}display':placements[i]['display']
                }
                export.update(runner)
            else:
                export.update({f'{i}place': 0})
        return export
    
    def get_csv_export_string(self):
        staged = []
        for runner in self.runners:
            if runner['start'] == 0:
                continue
            stage = {
                'Jersey': runner['jersey'],
                'Team': runner['team'],
                'Name': runner['name'],
            }
            for i, split in enumerate(self.split_labels):
                if runner['splits'][i] == 0:
                    break
                stage[split] = format_time(runner['splits'][i] - runner['start'])
                if i > 0:
                    stage[f'{split} - Split'] = format_time(runner['splits'][i] - runner['splits'][i - 1])
            
            if runner['finish'] > 0:
                if len(self.split_labels) > 0 and runner['splits'][-1] != 0:
                    stage['Finish - Split'] = format_time(runner['finish'] - runner['splits'][-1])
                stage['Finish'] = format_time(runner['finish'] - runner['start'])

            staged.append(stage)

        fieldnames = ['Jersey', 'Team', 'Name']

        for i, split in enumerate(self.split_labels):
            if i > 0:
                fieldnames.append(f'{split} - Split')
            fieldnames.append(split)

        if len(self.split_labels) > 0:
            fieldnames.append('Finish - Split')
        fieldnames.append('Finish')

        out = StringIO(newline='\n')
        csv_out = csv.DictWriter(out, fieldnames=fieldnames)
        csv_out.writeheader()
        csv_out.writerows(staged)

        ret = out.getvalue()
        out.close()
        return ret
    
    def get_admin_object(self):
        return {
            'visibility': self.visibility,
            'lower_third': self.lower_third
        }
    
    def export_visibility(self):
        return {
            'mode': 'visibility',
            'clock': self.visibility['clock'],
            'placement': self.visibility['placement'],
            'lower_third': self.visibility['lower_third']
        }

    def update_visibility(self, key: str, state: bool):
        self.visibility[key] = state
        self.overlay.push_json(self.export_visibility())
    
    def update_lower_third(self, title: str, subtitle: str):
        self.lower_third['title'] = title
        self.lower_third['subtitle'] = subtitle
        if self.lower_third['subtitle'] == '':
            self.lower_third['lower_third_mode'] = 'one_liner'
        else:
            self.lower_third['lower_third_mode'] = 'subtitled'
        
        self.overlay.push_json(self.export_lower_third())

        if not self.visibility['lower_third']:
            self.update_visibility('lower_third', True)
            self.socketio.emit('visibility-update', {'state': self.visibility['lower_third'], 'key': 'lower_third'}, namespace='/admin')

    def export_lower_third(self):
        return {
            'mode': 'lower_third',
            'title': self.lower_third['title'],
            'subtitle': self.lower_third['subtitle'],
            'lower_third_mode': self.lower_third['lower_third_mode']
        }
    
    def overlay_reset(self):
        self.overlay.push_json(self.export_visibility())
        self.overlay.push_json(self.export_placements())
        self.overlay.push_json(self.export_lower_third())


class Overlay:

    def __init__(self, title, tag, manager: CrossCountryManager):
        self.websock_server = websock.WebSocketServer('127.0.0.1', port=5500, on_connection_open=self.connection_handler)

        self.thread = Thread(target=self.runner)
        self.thread.start()

        self.race_start = 0
        self.clock_thread = Thread(target=self.clock_pulse)

        self.title = title
        self.tag = tag
        self.manager = manager

    def runner(self):
        self.websock_server.serve_forever()
    
    def push(self, data):
        self.websock_server.send_all(None, str(data))
    
    def push_json(self, dataObject):
        self.push(json.dumps(dataObject))

    def clock_pulse(self):
        while True:
            race_time = (time.time() * 1000) - self.race_start
            display = format_time_estimate(race_time)
            export = {
                'mode': 'clock',
                'display': display,
                'title': self.title,
                'tag': self.tag,
            }
            self.push_json(export)
            time.sleep(0.5)
    
    def start_clock(self, start_timestamp):
        self.race_start = start_timestamp
        self.clock_thread.start()
    
    def connection_handler(self, client):
        export = {
            'mode': 'clock',
            'display': '0:00',
            'title': self.title,
            'tag': self.tag,
        }
        self.push_json(export)

        self.manager.overlay_reset()
