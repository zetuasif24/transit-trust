from django.core.management.base import BaseCommand
from apps.routes.models import Route, Bus
from apps.accounts.models import Passenger

ROUTES = [
    dict(name='Mirpur-10 to Motijheel',      start_point='Mirpur-10',   end_point='Motijheel',    distance=12, official_fare=25),
    dict(name='Uttara to Farmgate',           start_point='Uttara',      end_point='Farmgate',     distance=18, official_fare=35),
    dict(name='Gazipur to Gulistan',          start_point='Gazipur',     end_point='Gulistan',     distance=30, official_fare=55),
    dict(name='Sadarghat to Mirpur-1',        start_point='Sadarghat',   end_point='Mirpur-1',     distance=10, official_fare=20),
    dict(name='Demra to Motijheel',           start_point='Demra',       end_point='Motijheel',    distance=15, official_fare=30),
    dict(name='Bashundhara to Karwan Bazar',  start_point='Bashundhara', end_point='Karwan Bazar', distance=8,  official_fare=18),
    dict(name='Narayanganj to Gulistan',      start_point='Narayanganj', end_point='Gulistan',     distance=25, official_fare=45),
    dict(name='Savar to Mirpur',              start_point='Savar',       end_point='Mirpur',       distance=22, official_fare=40),
]

BUSES = [
    dict(name='BRTC Bus A',      license_num='DHA-1234', route_index=0),
    dict(name='Dhaka Transit 5', license_num='DHA-5678', route_index=0),
    dict(name='City Link 7',     license_num='DHA-9101', route_index=1),
    dict(name='Metro Bus 3',     license_num='DHA-1121', route_index=2),
    dict(name='Rapid Bus 9',     license_num='DHA-3141', route_index=3),
    dict(name='Express Line 2',  license_num='DHA-4444', route_index=4),
    dict(name='City Shuttle 1',  license_num='DHA-7777', route_index=5),
]

class Command(BaseCommand):
    help = 'Seed the database with initial routes, buses, and demo accounts'

    def handle(self, *args, **kwargs):
        if Route.objects.exists():
            self.stdout.write('Database already seeded. Skipping.')
            return

        route_objects = []
        for r in ROUTES:
            obj = Route.objects.create(**r)
            route_objects.append(obj)
            self.stdout.write(f'  Route created: {obj.name}')

        for b in BUSES:
            Bus.objects.create(
                name=b['name'],
                license_num=b['license_num'],
                route=route_objects[b['route_index']]
            )
            self.stdout.write(f'  Bus created: {b["name"]}')

        if not Passenger.objects.filter(phone='01711000001').exists():
            Passenger.objects.create(full_name='Demo Passenger', phone='01711000001', password='demo123', gender='male', role='passenger')
            self.stdout.write('  Demo passenger created.')

        if not Passenger.objects.filter(phone='01711000002').exists():
            Passenger.objects.create(full_name='Admin User', phone='01711000002', password='admin123', gender='male', role='admin')
            self.stdout.write('  Admin user created.')

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
