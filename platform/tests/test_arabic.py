"""The Arabic report: engine sentences become Arabic with the client's own figures and names, nothing is lost silently."""

from clearline import arabic


def test_money_and_dates():
    assert arabic.money('EGP 3.66M') == '3.66 مليون جنيه'
    assert arabic.money('−EGP 6,374') == '−6,374 جنيه'
    assert arabic.money('USD 86K') == '86 ألف دولار'
    assert arabic.dates('03 Nov 2026') == '03 نوفمبر 2026'
    assert arabic.dates('Jan 26') == 'يناير 26'


def test_sentences_keep_figures_and_names():
    t = arabic.Arabic()
    out = t('Customers owe EGP 3.66M in all, across 108 customers; the top five hold 39% of it.')
    assert '3.66 مليون جنيه' in out and '108' in out and '39%' in out and 'customers' not in out
    out = t('Discounts stand out for شركة النور (100% of their purchases), Acme (20% of their purchases).')
    assert 'شركة النور (100% من مشترياته)' in out and 'Acme (20% من مشترياته)' in out
    assert t('Five product families bring 96% of sales, led by سوسته بلاستيك.').startswith('خمس عائلات منتجات')
    assert t('Sat and Wed are the busiest days: +9% and +8% on an average day.') == 'يوما السبت والأربعاء هما الأكثر بيعًا: +9% و+8% عن متوسط اليوم.'
    assert t('99 / 100') == '99 من 100'
    assert not t.missing


def test_cells_with_several_notes():
    t = arabic.Arabic()
    out = t.cell('7 returns or cancellations kept apart from sales · 116 invoices have no invoice number: each kept as its own invoice')
    assert out == '7 مرتجعات أو إلغاءات فُصلت عن المبيعات · 116 فاتورة بلا رقم: احتُفظ بكل منها كفاتورة مستقلة'
    assert t.cell('book.xlsx · العملاء') == 'book.xlsx · العملاء'


def test_untranslated_text_is_listed_not_hidden():
    t = arabic.Arabic()
    assert t('A sentence the engine never wrote before.') == 'A sentence the engine never wrote before.'
    assert t.missing == ['A sentence the engine never wrote before.']
    t.cell('Some English customer name')  # names in tables stay as written
    assert len(t.missing) == 1


def test_arabic_figures_read_back_for_the_number_check():
    assert arabic.as_english_figures('على العملاء 3.66 مليون جنيه، منها ١٢٥ ألف') == 'على العملاء EGP 3.66M، منها 125K'
