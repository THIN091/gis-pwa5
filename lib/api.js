function setCors(res){
  const origin=process.env.CORS_ORIGIN||"";
  res.setHeader("Access-Control-Allow-Origin",origin||"*");
  res.setHeader("Access-Control-Allow-Methods","GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type, X-API-Key");
}
function handleOptions(req,res){if(req.method==="OPTIONS"){setCors(res);res.status(204).end();return true}return false}
function requireApiKey(req,res){
  const configured=process.env.API_KEY;if(!configured)return true;
  if(req.headers["x-api-key"]!==configured){res.status(401).json({ok:false,error:"Unauthorized"});return false}
  return true;
}
function parseYear(v){if(v===undefined||v==="")return null;const n=Number(v);return Number.isInteger(n)&&n>=2500&&n<=3000?n:null}
function parseQuarter(v){if(v===undefined||v==="")return null;const n=Number(v);return Number.isInteger(n)&&n>=1&&n<=4?n:null}
function pick(o,paths,f=null){
  for(const path of paths){
    let x=o,ok=true;
    for(const p of path.split(".")){
      if(x==null||!(p in x)){ok=false;break}
      x=x[p]
    }
    if(ok&&x!==undefined&&x!==null)return x
  }
  return f
}

// ฟังก์ชันแปลงค่าตัวเลขอย่างปลอดภัย (รองรับ Decimal128, String, Number)
function parseNumber(val, defaultVal = 0) {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === 'object' && val.$numberDecimal) {
    val = val.$numberDecimal;
  }
  const n = Number(val);
  return Number.isFinite(n) ? n : defaultVal;
}

function normalizeDoc(doc){
  // ดึงค่า smart_1662_percentage จากหลายชื่อฟิลด์ที่อาจเป็นไปได้ใน MongoDB
  const rawSmart = pick(doc, [
    "metrics.smart_1662_percentage", "smart_1662_percentage",
    "metrics.smart1662_percentage", "smart1662_percentage",
    "metrics.smart_1662_pct", "smart_1662_pct",
    "metrics.smart1662Percentage", "smart1662Percentage",
    "metrics.smart_1662", "smart_1662",
    "metrics.smart1662", "smart1662",
    "smart_1662_percent", "smart1662_percent"
  ], null);

  // ดึงค่า completion_percentage
  const rawCompletion = pick(doc, [
    "metrics.completion_percentage", "completion_percentage",
    "metrics.completionPercentage", "completionPercentage",
    "metrics.pct", "pct", "ความสำเร็จ"
  ], null);

  return {
    id: doc._id ? String(doc._id) : null,
    fiscal_year: pick(doc, ["fiscal_year", "fiscalYear", "year", "ปี", "ปีงบประมาณ"]),
    quarter: pick(doc, ["quarter", "q", "ไตรมาส"]),
    branch: {
      code: pick(doc, ["branch.code", "branch_code", "branchCode", "รหัสสาขา"]),
      name: pick(doc, ["branch.name", "branch_name", "branchName", "สาขา", "ชื่อสาขา"])
    },
    metrics: {
      customer_count: parseNumber(pick(doc, ["metrics.customer_count", "customer_count", "customerCount", "จำนวนผู้ใช้น้ำ"], 0)),
      imported_customer_count: parseNumber(pick(doc, ["metrics.imported_customer_count", "imported_customer_count", "importedCustomerCount"], 0)),
      pipe_length_m: parseNumber(pick(doc, ["metrics.pipe_length_m", "pipe_length_m", "pipeLengthM", "ความยาวท่อ"], 0)),
      valve_count: parseNumber(pick(doc, ["metrics.valve_count", "valve_count", "valveCount", "จำนวนประตูน้ำ"], 0)),
      fire_hydrant_count: parseNumber(pick(doc, ["metrics.fire_hydrant_count", "fire_hydrant_count", "fireHydrantCount", "จำนวนหัวดับเพลิง"], 0)),
      leak_point_count: parseNumber(pick(doc, ["metrics.leak_point_count", "leak_point_count", "leakPointCount", "จุดรั่ว"], 0)),
      
      // ส่งค่า % ออกไปด้วย (หากไม่มีใน DB จะเป็น null)
      smart_1662_percentage: rawSmart !== null ? parseNumber(rawSmart, null) : null,
      completion_percentage: rawCompletion !== null ? parseNumber(rawCompletion, null) : null
    },
    updated_at: pick(doc, ["updated_at", "updatedAt", "แก้ไขล่าสุด"], null)
  }
}

function buildPeriodFilter(year,quarter){
  const f=[];
  if(year!==null)f.push({$or:[{fiscal_year:year},{fiscalYear:year},{year:year},{"ปี":year},{"ปีงบประมาณ":year}]});
  if(quarter!==null)f.push({$or:[{quarter:quarter},{q:quarter},{"ไตรมาส":quarter}]});
  return f.length===0?{}:f.length===1?f[0]:{$and:f};
}
function addBranchFilter(filter,branch,branchCode){
  const c=[];
  if(branch)c.push({"branch.name":branch},{branch_name:branch},{branchName:branch},{"สาขา":branch},{"ชื่อสาขา":branch});
  if(branchCode)c.push({"branch.code":branchCode},{branch_code:branchCode},{branchCode:branchCode},{"รหัสสาขา":branchCode});
  if(!c.length)return filter;
  return Object.keys(filter).length?{$and:[filter,{$or:c}]}:{$or:c};
}
module.exports={setCors,handleOptions,requireApiKey,parseYear,parseQuarter,normalizeDoc,buildPeriodFilter,addBranchFilter,pick};