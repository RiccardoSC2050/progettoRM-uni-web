from enum import Enum


class Resource(str, Enum):
    CONTRATTI = "contratti"
    SIM_ATTIVE = "simAttive"
    SIM_DISATTIVE = "simDisattive"
    SIM_NON_ATTIVE = "simNonAttive"
    TELEFONATE = "telefonate"

    @classmethod
    def parse(cls, value: str) -> "Resource":
        return cls(value)
