from django.db import models


class ContrattoTelefonico(models.Model):
    numero = models.CharField(max_length=30, primary_key=True)
    data_attivazione = models.DateField(null=True, blank=True)
    tipo = models.CharField(max_length=30, null=True, blank=True)
    minuti_residui = models.IntegerField(null=True, blank=True)
    credito_residuo = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = "contratto_telefonico"


class SimAttiva(models.Model):
    codice = models.CharField(max_length=50, primary_key=True)
    tipo_sim = models.CharField(max_length=30, null=True, blank=True)
    contratto = models.ForeignKey(
        ContrattoTelefonico,
        on_delete=models.CASCADE,
        db_column="associata_a",
        related_name="sim_attive",
    )
    data_attivazione = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "sim_attiva"


class SimDisattiva(models.Model):
    codice = models.CharField(max_length=50, primary_key=True)
    tipo_sim = models.CharField(max_length=30, null=True, blank=True)
    numero_contratto = models.CharField(max_length=30, null=True, blank=True)
    data_attivazione = models.DateField(null=True, blank=True)
    data_disattivazione = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "sim_disattiva"


class SimNonAttiva(models.Model):
    codice = models.CharField(max_length=50, primary_key=True)
    tipo_sim = models.CharField(max_length=30, null=True, blank=True)

    class Meta:
        db_table = "sim_non_attiva"


class Telefonata(models.Model):
    id = models.BigIntegerField(primary_key=True)
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
        db_table = "telefonata"
