from django.db import migrations


def set_admin_role_for_existing_superusers(apps, schema_editor):
    User = apps.get_model('users', 'User')
    User.objects.filter(is_superuser=True).update(role='admin', is_staff=True)


class Migration(migrations.Migration):
    dependencies = [
        ('users', '0002_alter_user_managers_alter_user_role'),
    ]

    operations = [
        migrations.RunPython(set_admin_role_for_existing_superusers, migrations.RunPython.noop),
    ]
