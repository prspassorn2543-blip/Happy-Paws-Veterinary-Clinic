# Happy-Paws-Veterinary-Clinic
# Happy Paws Veterinary Clinic Financial Dashboard

แดชบอร์ดวิเคราะห์ข้อมูลการเงินของคลินิกสัตวแพทย์ Happy Paws พัฒนาด้วย **Google Apps Script**, **Google Sheets** และ **Vercel** สำหรับแสดงผลรายได้ จำนวนการเข้ารับบริการ ลูกค้าเดิม/ลูกค้าใหม่ และข้อมูลเชิงวิเคราะห์ในรูปแบบ Dashboard

---

## 1. วัตถุประสงค์ของโครงงาน

โครงงานนี้จัดทำขึ้นเพื่อพัฒนา Dashboard สำหรับสรุปและวิเคราะห์ข้อมูลทางการเงินของคลินิกสัตวแพทย์ โดยมีวัตถุประสงค์ดังนี้

- แสดงภาพรวมรายได้รวมของคลินิก
- วิเคราะห์จำนวนครั้งการเข้ารับบริการ
- วิเคราะห์จำนวนลูกค้าใหม่และลูกค้าเดิม
- วิเคราะห์รายได้ตามประเภทบริการ
- วิเคราะห์รายได้ตามประเภทสัตว์เลี้ยง
- วิเคราะห์รายได้ตามสัตวแพทย์
- แสดงแนวโน้มรายได้รายเดือน
- สร้างข้อมูลเชิงลึก (Insights) เพื่อช่วยในการตัดสินใจ

---

## 2. เทคโนโลยีที่ใช้

- **Google Sheets** สำหรับจัดเก็บข้อมูล
- **Google Apps Script** สำหรับประมวลผลข้อมูลและสร้าง Web App / API
- **HTML / CSS / JavaScript** สำหรับส่วนแสดงผล Dashboard
- **Chart.js** สำหรับสร้างกราฟ
- **Vercel** สำหรับ Deploy หน้าเว็บ Dashboard

---

## 3. โครงสร้างข้อมูลใน Google Sheets

โปรเจกต์นี้ใช้ Google Sheets จำนวน 3 ชีตหลัก ได้แก่

### 3.1 Visits
ใช้เก็บข้อมูลการเข้ารับบริการ

คอลัมน์:
- `visit_id`
- `date`
- `time`
- `customer_id`
- `pet_type`
- `doctor_id`
- `service_id`
- `amount`

### 3.2 Services
ใช้เก็บข้อมูลประเภทบริการ

คอลัมน์:
- `service_id`
- `service_name`
- `price`

### 3.3 Doctors
ใช้เก็บข้อมูลสัตวแพทย์

คอลัมน์:
- `doctor_id`
- `doctor_name`
- `specialty`

---

## 4. ฟีเจอร์ของระบบ

- Hero KPI แสดงรายได้รวม, ค่าใช้จ่ายเฉลี่ยต่อบิล, Projection และ MoM Growth
- Supporting KPI แสดงจำนวน Visits, จำนวนลูกค้าไม่ซ้ำ, Return Rate และ Average Monthly Revenue
- กราฟแนวโน้มรายได้รายเดือน
- กราฟเปรียบเทียบ Revenue / Visits
- แสดงรายได้รายไตรมาส
- แสดงรายได้ตามบริการ
- แสดงรายได้ตามประเภทสัตว์เลี้ยง
- แสดงรายได้ตามสัตวแพทย์
- แสดง New vs Returning Customers
- แสดง Insight อัตโนมัติจากข้อมูล

---

## 5. วิธีการทำงานของระบบ

1. ข้อมูลถูกจัดเก็บไว้ใน Google Sheets
2. Google Apps Script อ่านข้อมูลจาก Sheets
3. Apps Script ประมวลผลข้อมูลและส่งออกเป็น JSON API
4. หน้าเว็บบน Vercel เรียกข้อมูลจาก Apps Script API
5. JavaScript นำข้อมูลมาแสดงผลบน Dashboard
6. ใช้ Chart.js สำหรับวาดกราฟ

---

## 6. สิ่งที่ต้องส่ง

| # | ประเภท | รายละเอียด |
|---|--------|------------|
| 1 | URL ของ Web App | Google Apps Script Web App: <br> https://script.google.com/macros/s/AKfycbwzrr9_VDQdJ22YHCwzUTOK2_CA-MxeMGMXmtBWtzrgBkwQcSUBrrhYSiC_ObqR1MFTyg/exec |
| 2 | URL ของ Vercel Deployment | เว็บไซต์ที่ Deploy บน Vercel: <br> https://happy-paws-veterinary-clinic.vercel.app |

---

## 7. วิธีใช้งาน

### Google Apps Script Web App
เปิดผ่านลิงก์:
https://script.google.com/macros/s/AKfycbwzrr9_VDQdJ22YHCwzUTOK2_CA-MxeMGMXmtBWtzrgBkwQcSUBrrhYSiC_ObqR1MFTyg/exec

### Vercel Deployment
เปิดผ่านลิงก์:
https://happy-paws-veterinary-clinic.vercel.app

---

## 8. API Endpoint

ระบบมี API สำหรับส่งข้อมูล Dashboard ในรูปแบบ JSON ดังนี้

```text
https://script.google.com/macros/s/AKfycbwzrr9_VDQdJ22YHCwzUTOK2_CA-MxeMGMXmtBWtzrgBkwQcSUBrrhYSiC_ObqR1MFTyg/exec?api=1
