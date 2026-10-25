with open(r"c:\Users\PLP\Documents\3RD YEAR\techno\silicon-trading\scripts\update_workspace.py", "r", encoding="utf-8") as f:
    text = f.read()

# The string is inside workspace_code = """..."""
start_tag = 'workspace_code = """'
end_tag = '"""\n\nwith open(r"c:\\Users\\PLP\\Music'
if start_tag in text and end_tag in text:
    inner = text.split(start_tag, 1)[1].split(end_tag, 1)[0]
    # Unescape \"
    inner = inner.replace('\\"', '"')
    with open(r"c:\Users\PLP\Music\Scrum stuff mine\components\ScrumWorkspace.tsx", "w", encoding="utf-8") as out:
        out.write(inner)
    print("Successfully extracted and wrote ScrumWorkspace.tsx")
else:
    print("Tags not found")
