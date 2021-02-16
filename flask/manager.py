'''ScoreBox Cross Country Manager'''
import time
from operator import itemgetter

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
    
    for i, line in enumerate(lines[13:]):
        fields = line.split(',')
        runner = {
            'runner_index': i,
            'jersey': fields[0],
            'name': fields[2],
            'team': fields[1],
            'color': team_colors[fields[1]],
            'start': 0,
            'splits': split_template.copy(),
            'finish': 0
        }
        runners.append(runner)
    return title, tag, split_labels, team_colors, runners

def format_time(milliseconds):
    rounded = round(milliseconds / 1000, 1)
    string_time, decimal = str(rounded).split('.')
    pretty_time = time.strftime('%M:%S', time.gmtime(int(string_time)))
    if pretty_time[0] == '0':
        pretty_time = pretty_time[1:]
        if pretty_time[0] == '0':
            pretty_time = pretty_time[2:]
    return f'{pretty_time}.{decimal}'

class CrossCountryManager:
    
    def __init__(self, csv):
        self.title, self.tag, self.split_labels, self.team_colors, self.runners = process_csv(csv)

        self.start = 0

        self.splits = len(self.split_labels) * [None]
        self.finish = None

    def start_event(self, timestamp):
        self.start = timestamp
        for i in range(len(self.runners)):
            self.runners[i]['start'] = timestamp
    
    def split(self, split_index: int, runner_index: int, timestamp):
        self.runners[runner_index]['splits'][split_index] = timestamp
        self.splits[split_index] = self.get_results(split_index)
    
    def finish_runner(self, runner_index: int, timestamp):
        self.runners[runner_index]['finish'] = timestamp
        self.finish = self.get_finish_results()

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
            'runners': self.runners
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
        placements = placements[:5] + placements[5:][(-1 * (max_entries - 5)):]
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