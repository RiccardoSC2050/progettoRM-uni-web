def pick(record: dict, *names: str):
    for name in names:
        if name in record:
            return record[name]
    return None
