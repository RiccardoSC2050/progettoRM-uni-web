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
            options={"db_table": "contratto_telefonico", "ordering": ("numero",)},
        ),
        migrations.CreateModel(
            name="SimAttiva",
            fields=[
                ("codice", models.CharField(max_length=50, primary_key=True, serialize=False)),
                ("tipo_sim", models.CharField(blank=True, max_length=30, null=True)),
                ("data_attivazione", models.DateField(blank=True, null=True)),
                (
                    "contratto",
                    models.OneToOneField(
                        db_column="associata_a",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="sim_attiva",
                        to="migration_api.contrattotelefonico",
                    ),
                ),
            ],
            options={"db_table": "sim_attiva", "ordering": ("contratto_id", "codice")},
        ),
        migrations.CreateModel(
            name="SimDisattiva",
            fields=[
                ("codice", models.CharField(max_length=50, primary_key=True, serialize=False)),
                ("tipo_sim", models.CharField(blank=True, max_length=30, null=True)),
                ("data_attivazione", models.DateField(blank=True, null=True)),
                ("data_disattivazione", models.DateField(blank=True, null=True)),
                (
                    "contratto",
                    models.ForeignKey(
                        db_column="numero_contratto",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="sim_disattive",
                        to="migration_api.contrattotelefonico",
                    ),
                ),
            ],
            options={"db_table": "sim_disattiva", "ordering": ("contratto_id", "codice")},
        ),
        migrations.CreateModel(
            name="Telefonata",
            fields=[
                ("record_id", models.BigAutoField(db_column="_record_id", primary_key=True, serialize=False)),
                ("id", models.BigIntegerField()),
                ("data", models.DateField(blank=True, null=True)),
                ("ora", models.TimeField(blank=True, null=True)),
                ("durata", models.IntegerField(blank=True, null=True)),
                ("costo", models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                (
                    "contratto",
                    models.ForeignKey(
                        db_column="effettuata_da",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="telefonate",
                        to="migration_api.contrattotelefonico",
                    ),
                ),
            ],
            options={
                "db_table": "telefonata",
                "ordering": ("contratto_id", "id"),
                "indexes": [
                    models.Index(fields=["contratto", "data", "ora"], name="idx_tel_contr_data")
                ],
                "constraints": [
                    models.UniqueConstraint(
                        fields=("contratto", "id"),
                        name="uq_telefonata_contratto_id",
                    )
                ],
            },
        ),
    ]
