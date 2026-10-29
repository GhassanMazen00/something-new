"""Reading messy files: date order, weekly marketing sheets, product names."""

import pandas as pd

from clearline import engine, intake
from clearline.engine.calendar import market_settings


def dates(values, dayfirst=None):
    v, df = intake.to_date(pd.Series(values), dayfirst)
    return [x.strftime('%Y-%m-%d') if pd.notna(x) else None for x in v], df


def test_us_dates_are_not_swapped():
    # 5/22 only fits month first, so 12/1 must be 1 December, not 12 January.
    assert dates(['12/1/2010 8:26', '1/9/2011 15:18', '5/22/2011 14:29']) == (['2010-12-01', '2011-01-09', '2011-05-22'], False)


def test_day_first_dates():
    assert dates(['01/10/2024', '13/10/2024', '31/12/2024 19:00']) == (['2024-10-01', '2024-10-13', '2024-12-31'], True)
    assert dates(['05.03.2024', '25.03.2024'])[0] == ['2024-03-05', '2024-03-25']


def test_ambiguous_dates_follow_the_choice():
    assert dates(['3/4/24', '4/5/24'])[0] == ['2024-04-03', '2024-05-04']
    assert dates(['3/4/24', '4/5/24'], dayfirst=False)[0] == ['2024-03-04', '2024-04-05']


def test_arabic_digits_and_iso():
    assert dates(['١٢/٠٣/٢٠٢٤', '15/03/2024'])[0] == ['2024-03-12', '2024-03-15']
    assert dates(['2024-01-05', '2024-02-05 10:00'])[0] == ['2024-01-05', '2024-02-05']


def test_weekly_marketing_sheet_is_reshaped():
    weeks = pd.date_range('2023-01-02', periods=60, freq='W-MON')
    df = pd.DataFrame({'Week': weeks.strftime('%Y-%m-%d'), 'Revenue': [str(100000 + i * 500) for i in range(60)], 'TV spend': ['5000'] * 60, 'facebook_S': [str(1000 + i) for i in range(60)], 'Search cost': ['800'] * 60})
    kind, mapping, _ = intake.suggest_kind('marketing_weekly.csv', df)
    assert kind == 'adswide'
    std, health = intake.standardize(kind, df, mapping)
    assert sorted(std['channel'].unique()) == ['Facebook', 'Search', 'TV']
    assert len(std) == 180 and health['channels']
    data = engine.build_data({'ads': [std]}, market_settings('USD'))
    out = engine.run('budget-split-across-channels', data, None, {'currency': 'USD'})
    assert 'result' in out, out.get('error')
    assert engine.readiness(engine.BY_ID['ad-channel-performance'], data)['level'] == 'none'


def test_product_names_come_from_the_sales_file():
    df = pd.DataFrame({'InvoiceDate': ['2024-01-0%d' % (i % 9 + 1) for i in range(30)], 'StockCode': ['A1', 'B2', 'C3'] * 10, 'Description': ['Lamp', 'Chair', 'Table'] * 10, 'Quantity': ['1'] * 30, 'UnitPrice': ['10'] * 30})
    kind, mapping, _ = intake.suggest_kind('sales.csv', df)
    assert mapping['product'] == 'StockCode' and mapping['product_name'] == 'Description'
    std, _ = intake.standardize(kind, df, mapping)
    data = engine.build_data({'sales': [std]})
    assert data.label(pd.Series(['A1', 'C3'])).tolist() == ['Lamp', 'Table']


def test_market_calendar_from_currency():
    assert market_settings('EGP') == {'ramadan': True, 'weekend': [4, 5]}
    assert market_settings('AED') == {'ramadan': True, 'weekend': [5, 6]}
    assert market_settings('GBP') == {'ramadan': False, 'weekend': [5, 6]}
    assert market_settings('GBP', {'ramadan': True})['ramadan'] is True


def test_cancelled_orders_and_postage_are_not_products():
    rows = []
    for i in range(60):
        rows.append({'date': f'2024-01-{i % 28 + 1:02d}', 'order_id': f'A{i}', 'customer': f'C{i % 7}', 'product': ['Lamp', 'Chair', 'Table'][i % 3], 'qty': '2', 'price': '10'})
    rows.append({'date': '2024-01-10', 'order_id': 'BIG', 'customer': 'C1', 'product': 'Vase', 'qty': '5000', 'price': '10'})  # mistaken order...
    rows.append({'date': '2024-01-10', 'order_id': 'CBIG', 'customer': 'C1', 'product': 'Vase', 'qty': '-5000', 'price': '10'})  # ...cancelled minutes later
    rows.append({'date': '2024-01-11', 'order_id': 'P1', 'customer': 'C2', 'product': 'POSTAGE', 'qty': '1', 'price': '900'})
    df = pd.DataFrame(rows)
    std, _ = intake.standardize('sales', df, {k: k for k in df.columns})
    data = engine.build_data({'sales': [std]})
    assert 'Vase' not in set(data.sales['product'])
    assert data.cancelled['lines'] == 1
    assert 'POSTAGE' in set(data.sales['product']) and 'POSTAGE' not in set(data.goods(data.sales)['product'])
