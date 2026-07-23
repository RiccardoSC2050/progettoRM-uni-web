from django.db import models

from migration_api.domain.schema import (
    ACTIVE_SIM_TABLE,
    CALL_TABLE,
    CONTRACT_TABLE,
    INACTIVE_SIM_TABLE,
)


class ContrattoTelefonico(models.Model):
    numero = models.CharField(max_length=30, primary_key=True)
    data_attivazione = models.DateField(null=True, blank=True)
    tipo = models.CharField(max_length=30, null=True, blank=True)
    minuti_residui = models.IntegerField(null=True, blank=True)
    credito_residuo = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = CONTRACT_TABLE
        ordering = ("numero",)


class SimAttiva(models.Model):
    codice = models.CharField(max_length=50, primary_key=True)
    tipo_sim = models.CharField(max_length=30, null=True, blank=True)
    contratto = models.OneToOneField(
        ContrattoTelefonico,
        on_delete=models.CASCADE,
        db_column="associata_a",
        related_name="sim_attiva",
    )
    data_attivazione = models.DateField(null=True, blank=True)

    class Meta:
        db_table = ACTIVE_SIM_TABLE
        ordering = ("contratto_id", "codice")


class SimDisattiva(models.Model):
    codice = models.CharField(max_length=50, primary_key=True)
    tipo_sim = models.CharField(max_length=30, null=True, blank=True)
    contratto = models.ForeignKey(
        ContrattoTelefonico,
        on_delete=models.CASCADE,
        db_column="numero_contratto",
        related_name="sim_disattive",
    )
    data_attivazione = models.DateField(null=True, blank=True)
    data_disattivazione = models.DateField(null=True, blank=True)

    class Meta:
        db_table = INACTIVE_SIM_TABLE
        ordering = ("contratto_id", "codice")


class Telefonata(models.Model):
    # Nel database sorgente l'id della telefonata è progressivo per contratto,
    # quindi non è globalmente univoco. La chiave tecnica resta interna e non
    # viene mostrata nel visualizzatore; l'identità funzionale è
    # (contratto, id), come previsto dallo schema del Progetto 1.
    record_id = models.BigAutoField(primary_key=True, db_column="_record_id")
    id = models.BigIntegerField()
    contratto = models.ForeignKey(
        ContrattoTelefonico,
        on_delete=models.CASCADE,
        db_column="effettuata_da",
        related_name="telefonate",
    )
    data = models.DateField(null=True, blank=True)
    ora = models.TimeField(null=True, blank=True)
    durata = models.IntegerField(null=True, blank=True)
    costo = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = CALL_TABLE
        ordering = ("contratto_id", "id")
        constraints = [
            models.UniqueConstraint(
                fields=("contratto", "id"),
                name="uq_telefonata_contratto_id",
            ),
        ]
        indexes = [
            models.Index(
                fields=("contratto", "data", "ora"),
                name="idx_tel_contr_data",
            ),
        ]


DESTINATION_MODELS = (
    ContrattoTelefonico,
    SimAttiva,
    SimDisattiva,
    Telefonata,
)
