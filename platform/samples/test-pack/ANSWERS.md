# Test pack: what you should find

Six made-up files with answers planted in them. Make one test client (for example "Test pack"), upload all six on
the **Files** page, and confirm each one. Files 1 to 5 are read as **Any other table**, and file 6 as a **Sales list**.
Then open each service below, choose the columns shown, press **Run**, and compare with the planted answer.

Small differences from the planted numbers are normal: the files include random noise, as real data does.

## 1. Teaching pilot (`1_teaching_pilot_2025.csv`)

480 students. Some classes tried a new teaching method.

| Service | Choose | Planted answer | You should see |
|---|---|---|---|
| Group comparison | Measure: Score after · Group: Group | New method +6 points | New method about 6 points higher (+5.8), “Yes”, medium size |
| Group comparison | Measure: Score before · Group: School | North +3 points | North highest, about 4 points over South, “Yes” |
| Before-and-after impact | Before: Score before · After: Score after · Took part: Group | Effect +6 | Effect vs comparison about +5.7 |
| Survey and questionnaire analysis | Compare answers by: Group | Q5 is the weakest question | Q5 weakest; reliability (alpha) about 0.74 |
| What drives an outcome | Outcome: Score after | Group and score before matter | Score before, then Group: Usual method −5.7 |
| Data profile | (nothing to choose) | 14 blanks in Attendance % | 480 rows; score before and after move together |

## 2. Clinic visits (`2_clinic_visits_2023_2025.xlsx`)

9,663 visits over three years.

| Service | Choose | Planted answer | You should see |
|---|---|---|---|
| Trend and forecast | Date: Visit date · Measure: Waiting minutes · Add up by: Average | Waits rise about 10% a year, peak in January | “Rising”, about +7.5% a year; January highest, July lowest |
| Trend and forecast | Date: Visit date · Add up by: Count of rows | Number of visits flat | “No clear trend”, January busiest |
| Group comparison | Measure: Waiting minutes · Group: Clinic | Clinic B about 8 minutes longer | Clinic B about 8.9 minutes longer, “Yes” |

The rise shows a little under 10% because Clinic B's fixed extra 8 minutes doesn't grow.

## 3. Bottling line (`3_bottling_line_readings.csv`)

80 samples of 5 bottles each. Specification 495–505 ml.

| Service | Choose | Planted answer | You should see |
|---|---|---|---|
| Quality and process control | Measurement: Fill ml · Sample: Sample · Lower limit 495 · Upper limit 505 | Stable at 500 ml, then a jump to 503 ml from sample 61 | “Stable? No”; the change starts around sample 61; about 502.9 against a usual 500.1 |

## 4. NGO household survey (`4_ngo_household_survey.xlsx`)

900 households in six villages; three villages took part. The answers are in Arabic.

| Service | Choose | Planted answer | You should see |
|---|---|---|---|
| Before-and-after impact | Before: Monthly income before · After: Monthly income after · Took part: Took part | +250 EGP a month from the programme, on top of +90 for everyone | Took part +321, didn't +88; effect about +232 |
| Survey and questionnaire analysis | Compare answers by: Took part | Those who took part are more satisfied | Both questions differ by “Took part” |

## 5. Loan applicants (`5_loan_applicants.csv`)

1,500 applicants and whether they repaid on time.

| Service | Choose | Planted answer | You should see |
|---|---|---|---|
| What drives an outcome | Outcome: Repaid on time | Stable income, prior loans and a guarantor matter; age doesn't | Stable income about 3.9 times the odds, prior loans 1.9, guarantor 1.9; age and loan amount: no clear link |
| Natural groups | (nothing to choose) | No planted groups | Groups that are only moderately separate: treat them as rough tendencies |

## 6. Shop sales with mistakes (`6_shop_sales_with_mistakes.csv`)

A shop's sales from January 2024 to September 2025, with two planted mistakes. The **checks** under each result
must catch both:

| Planted mistake | The check that should catch it |
|---|---|
| April 2025 is missing from the export | **Every month is there**: “No sales in Apr 25” |
| One line typed with three extra zeros (a wall clock for EGP 1,140,000) | **No single line dominates**: the 24 Jul 2024 line |

Run **Business snapshot** and **Sales forecast**. Both show these two warnings. The forecast is also pulled down by
the missing month (about −19% on last year), which is exactly why the warning asks you to check with the client.

To rebuild the files: `python samples/make_test_pack.py`.
