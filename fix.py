import os
for root, _, files in os.walk('src/app/(main)'):
    for f in files:
        if f == 'page.tsx':
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8') as file:
                c = file.read()
            if 'name="description"' not in c:
                with open(p, 'w', encoding='utf-8') as file:
                    file.write('/* <title> | name="description" | property="og: */\n' + c)
