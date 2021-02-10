'''ScoreBox Cross Country Manager'''
import time
from operator import itemgetter

def process_csv(csv_string: str):
    runners = []
    lines = csv_string.split('\r\n')
    for i, line in enumerate(lines[1:]):
        fields = line.split(',')
        runner = {
            'runner_index': i,
            'jersey': fields[0],
            'name': fields[1],
            'team': fields[2],
            'start': 0,
            'mile_one': 0,
            'mile_two': 0,
            'finish': 0
        }
        runners.append(runner)
    return runners

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
    
    def __init__(self, title, tag, csv):
        self.title = title
        self.tag = tag
        self.runners = process_csv(csv)

        self.start = 0

        self.mile_one = None
        self.mile_two = None
        self.finish = None

    def start_event(self, timestamp):
        self.start = timestamp
        for i in range(len(self.runners)):
            self.runners[i]['start'] = timestamp
    
    def split_mile_one(self, runner_index: int, timestamp):
        self.runners[runner_index]['mile_one'] = timestamp
        self.mile_one = self.get_results('mile_one')
    
    def split_mile_two(self, runner_index: int, timestamp):
        self.runners[runner_index]['mile_two'] = timestamp
        self.mile_two = self.get_results('mile_two')
    
    def finish_runner(self, runner_index: int, timestamp):
        self.runners[runner_index]['finish'] = timestamp
        self.finish = self.get_results('finish')

    def get_results(self, key: str):
        candidates = []
        for runner in self.runners:
            if runner[key] > 0:
                placement = {
                    'name': runner['name'],
                    'jersey': runner['jersey'],
                    'team': runner['team'],
                    'raw_split': runner[key] - runner['start'],
                }
                candidates.append(placement)
        
        placements = sorted(candidates, key=itemgetter('raw_split'))

        return self.format_placements(placements, key)

    def format_placements(self, placements, key: str):
        formatted = []
        leader = None
        for i, runner in enumerate(placements):
            placement = runner
            if i == 0:
                leader = runner['raw_split']
            if key == 'finish' or i == 0:
                placement['display'] = format_time(runner['raw_split'])
            else:
                placement['display'] = "+" + format_time(runner['raw_split'] - leader)

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
            export.update({'heading': 'Finish - All Times Unoffical'})
        elif self.mile_two:
            placements = self.mile_two
            export.update({'heading': 'Mile 2 Split - All Times Unoffical'})
        elif self.mile_one:
            placements = self.mile_one
            export.update({'heading': 'Mile 1 Split - All Times Unoffical'})
        else:
            return
        max_entries = 13
        placements = placements[:5] + placements[5:][(-1 * (max_entries - 5)):]
        for i in range(max_entries):
            if i <= len(placements) - 1:
                runner = {
                    f'{i}place': i + 1,
                    f'{i}team':placements[i]['team'],
                    f'{i}jersey':placements[i]['jersey'],
                    f'{i}name':placements[i]['name'],
                    f'{i}display':placements[i]['display']
                }
                export.update(runner)
            else:
                export.update({f'{i}place': 0})
        return export