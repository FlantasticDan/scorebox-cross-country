This directory should contain the Pyinstaller bundle of `flask/main.py` with `main.exe` as the entry point.

# Building
`pyinstaller --distpath /bundles/flask --workpath /build main.spec`

### Pyinstaller Spec File
```spec
# -*- mode: python ; coding: utf-8 -*-

block_cipher = None


a = Analysis(['main.py'],
             pathex=['PATH TO main.py'],
             binaries=[],
             datas=[('templates', 'templates'), ('static', 'static')],
             hiddenimports=[
                 'engineio.async_drivers.eventlet',
                 'eventlet.hubs.epolls',
                 'eventlet.hubs.kqueue',
                 'eventlet.hubs.selects',
                 'dns.dnssec',
                 'dns.e164',
                 'dns.hash',
                 'dns.namedict',
                 'dns.tsigkeyring',
                 'dns.update',
                 'dns.version',
                 'dns.zone'
                 ],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          [],
          exclude_binaries=True,
          name='main',
          debug=False,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
          console=True )
coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas,
               strip=False,
               upx=True,
               upx_exclude=[],
               name='main')
```
