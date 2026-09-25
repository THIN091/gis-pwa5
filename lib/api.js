function normalizeDoc(doc){
  return {
    id: doc._id ? String(doc._id) : null,
    fiscal_year: pick(doc, ["fiscal_year", "fiscalYear", "year", "ปี", "ปีงบประมาณ"]),
    quarter: pick(doc, ["quarter", "q", "ไตรมาส"]),
    branch: {
      code: pick(doc, ["branch.code", "branch_code", "branchCode", "รหัสสาขา"]),
      name: pick(doc, ["branch.name", "branch_name", "branchName", "สาขา", "ชื่อสาขา"])
    },
    metrics: {
      customer_count: pick(doc, ["metrics.customer_count", "customer_count", "customerCount", "จำนวนผู้ใช้น้ำ"], 0),
      imported_customer_count: pick(doc, ["metrics.imported_customer_count", "imported_customer_count", "importedCustomerCount"], 0),
      pipe_length_m: pick(doc, ["metrics.pipe_length_m", "pipe_length_m", "pipeLengthM", "ความยาวท่อ"], 0),
      valve_count: pick(doc, ["metrics.valve_count", "valve_count", "valveCount", "จำนวนประตูน้ำ"], 0),
      fire_hydrant_count: pick(doc, ["metrics.fire_hydrant_count", "fire_hydrant_count", "fireHydrantCount", "จำนวนหัวดับเพลิง"], 0),
      leak_point_count: pick(doc, ["metrics.leak_point_count", "leak_point_count", "leakPointCount", "จุดรั่ว"], 0),
      
      // 🟢 แก้ไขเพิ่ม 2 บรรทัดนี้เพื่อส่งค่า % ออกไปด้วย:
      smart_1662_percentage: pick(doc, ["metrics.smart_1662_percentage", "smart_1662_percentage", "smart1662_percentage", "smart_1662_pct", "smart1662Percentage", "smart_1662"], null),
      completion_percentage: pick(doc, ["metrics.completion_percentage", "completion_percentage", "completionPercentage", "pct"], null)
    },
    updated_at: pick(doc, ["updated_at", "updatedAt", "แก้ไขล่าสุด"], null)
  }
}