from django.test import SimpleTestCase

from migration_api.domain.resources import Resource
from migration_api.infrastructure.database import validate_name


class DatabaseNameValidationTests(SimpleTestCase):
    def test_accepts_valid_name(self):
        self.assertEqual(validate_name("progetto2_test"), "progetto2_test")

    def test_rejects_name_starting_with_number(self):
        with self.assertRaises(ValueError):
            validate_name("2progetto")

    def test_rejects_reserved_database(self):
        with self.assertRaises(ValueError):
            validate_name("postgres")

    def test_rejects_template_database(self):
        with self.assertRaises(ValueError):
            validate_name("template1")


class ResourceTests(SimpleTestCase):
    def test_parses_supported_resource(self):
        self.assertIs(Resource.parse("contratti"), Resource.CONTRATTI)

    def test_rejects_unknown_resource(self):
        with self.assertRaises(ValueError):
            Resource.parse("sconosciuta")
