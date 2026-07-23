from django.test import SimpleTestCase

from migration_api.domain.schema import (
    CONTRACT_TABLE,
    PROJECT_TABLE_NAMES,
    TABLE_BY_NAME,
    table_spec,
)


class SchemaMetadataTests(SimpleTestCase):
    def test_contract_table_is_registered(self):
        self.assertIn(CONTRACT_TABLE, PROJECT_TABLE_NAMES)

    def test_related_tables_define_contract_column(self):
        for name in ("sim_attiva", "sim_disattiva", "telefonata"):
            self.assertIsNotNone(TABLE_BY_NAME[name].contract_column)

    def test_rejects_unknown_table(self):
        with self.assertRaises(ValueError):
            table_spec("auth_user")

    def test_call_table_hides_internal_primary_key(self):
        call_table = TABLE_BY_NAME["telefonata"]
        self.assertEqual(
            call_table.columns,
            ("id", "effettuata_da", "data", "ora", "durata", "costo"),
        )
        self.assertNotIn("_record_id", call_table.columns)

