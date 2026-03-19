import fitz
doc = fitz.open(r'f:\Test\SVW_te_te_clean_centered_layout_v2.pdf')
page = doc.load_page(0)
pix = page.get_pixmap(dpi=150)
pix.save(r'f:\Test\layout.png')
