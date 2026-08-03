from django.core.management.base import BaseCommand
from apps.users.models import User, Profile, JobseekerProfile, EmployerProfile


class Command(BaseCommand):
    help = 'Create missing profiles for all users'

    def handle(self, *args, **options):
        users_without_profile = []
        users_without_jobseeker_profile = []
        users_without_employer_profile = []

        for user in User.objects.all():
            # Check for generic Profile
            if not hasattr(user, 'profile'):
                Profile.objects.create(user=user)
                users_without_profile.append(user.email)
                self.stdout.write(self.style.SUCCESS(f'Created Profile for {user.email}'))

            # Check for role-specific profiles
            if user.role == 'jobseeker' and not hasattr(user, 'jobseeker_profile'):
                JobseekerProfile.objects.create(user=user)
                users_without_jobseeker_profile.append(user.email)
                self.stdout.write(self.style.SUCCESS(f'Created JobseekerProfile for {user.email}'))
            elif user.role == 'employer' and not hasattr(user, 'employer_profile'):
                EmployerProfile.objects.create(user=user)
                users_without_employer_profile.append(user.email)
                self.stdout.write(self.style.SUCCESS(f'Created EmployerProfile for {user.email}'))

        self.stdout.write(self.style.SUCCESS(f'\nSummary:'))
        self.stdout.write(self.style.SUCCESS(f'Created {len(users_without_profile)} generic Profiles'))
        self.stdout.write(self.style.SUCCESS(f'Created {len(users_without_jobseeker_profile)} JobseekerProfiles'))
        self.stdout.write(self.style.SUCCESS(f'Created {len(users_without_employer_profile)} EmployerProfiles'))
