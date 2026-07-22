from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = []

    operations = [
        migrations.CreateModel(
            name="ContrattoTelefonico",
            fields=[
                ("numero", models.CharField(max_length=30, primary_key=True, serialize=False)),
                ("data_attivazione", models.DateField(blank=True, null=True)),
                ("tipo", models.CharField(blank=True, max_length=30, null=True)),
                ("minuti_residui", models.IntegerField(blank=True, null=True)),
                ("credito_residuo", models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
            ],
            options={"db_table": "contratto_telefonico"},
        ),
        migrations.CreateModel(
            name="SimDisattiva",
            fields=[
                ("codice", models.CharField(max_length=50, primary_key=True, serialize=False)),
                ("tipo_sim", models.CharField(blank=True, max_length=30, null=True)),
                ("numero_contratto", models.CharField(blank=True, max_length=30, null=True)),
                ("data_attivazione", models.DateField(blank=True, null=True)),
                ("data_disattivazione", models.DateField(blank=True, null=True)),
            ],
            options={"db_table": "sim_disattiva"},
        ),
        migrations.CreateModel(
            name="SimNonAttiva",
            fields=[
                ("codice", models.CharField(max_length=50, primary_key=True, serialize=False)),
                ("tipo_sim", models.CharField(blank=True, max_length=30, null=True)),
            ],
            options={"db_table": "sim_non_attiva"},
        ),
        migrations.CreateModel(
            name="SimAttiva",
            fields=[
                ("codice", models.CharField(max_length=50, primary_key=True, serialize=False)),
                ("tipo_sim", models.CharField(blank=True, max_length=30, null=True)),
                ("data_attivazione", models.DateField(blank=True, null=True)),
                ("contratto", models.ForeignKey(
                    db_column="associata_a",
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="sim_attive",
                    to="migration_api.contrattotelefonico",
                )),
            ],
            options={"db_table": "sim_attiva"},
        ),
        migrations.CreateModel(
            name="Telefonata",
            fields=[
                ("id", models.BigIntegerField(primary_key=True, serialize=False)),
                ("data", models.DateField(blank=True, null=True)),
                ("ora", models.TimeField(blank=True, null=True)),
                ("durata", models.IntegerField(blank=True, null=True)),
                ("costo", models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ("contratto", models.ForeignKey(
                    db_column="effettuata_da",
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="telefonate",
                    to="migration_api.contrattotelefonico",
                )),
            ],
            options={"db_table": "telefonata"},
        ),
    ]
