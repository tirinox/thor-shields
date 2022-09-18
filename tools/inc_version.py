from pathlib import Path

VERSION_FILE = './public/version.txt'

def increment_version(version):
    version = version.split('.')
    version[-1] = str(int(version[-1]) + 1)
    return '.'.join(version)

def main():
    Path(VERSION_FILE).touch()

    with open(VERSION_FILE, 'r+') as f:
        version = f.read().strip()
        if not version:
            version = '0.0.0'

        print(f'Current version is {version}.')
        new_version = increment_version(version)
        print(f'The next version is {new_version}.')

        f.seek(0)
        f.truncate()
        f.write(new_version)


if __name__ == "__main__":
    main()