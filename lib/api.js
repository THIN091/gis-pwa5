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
function pick(o,paths,f=null){for(const path of paths){let x=o,ok=true;for(const p of path.split(".")){if(x==null||!(p in x)){ok=false;break}x=x[p]}if(ok&&x!==undefined&&x!==null)return x}return f}
function normalizeDoc(doc){
  return {id:doc._id?String(doc._id):null,
    fiscal_year:pick(doc,["fiscal_year","fiscalYear","year","ปี","ปีงบประมาณ"]),
    quarter:pick(doc,["quarter","q","ไตรมาส"]),
    branch:{code:pick(doc,["branch.code","branch_code","branchCode","รหัสสาขา"]),
            name:pick(doc,["branch.name","branch_name","branchName","สาขา","ชื่อสาขา"])},
    metrics:{
      customer_count:pick(doc,["metrics.customer_count","customer_count","customerCount","จำนวนผู้ใช้น้ำ"],0),
      imported_customer_count:pick(doc,["metrics.imported_customer_count","imported_customer_count","importedCustomerCount"],0),
      pipe_length_m:pick(doc,["metrics.pipe_length_m","pipe_length_m","pipeLengthM","ความยาวท่อ"],0),
      valve_count:pick(doc,["metrics.valve_count","valve_count","valveCount","จำนวนประตูน้ำ"],0),
      fire_hydrant_count:pick(doc,["metrics.fire_hydrant_count","fire_hydrant_count","fireHydrantCount","จำนวนหัวดับเพลิง"],0),
      leak_point_count:pick(doc,["metrics.leak_point_count","leak_point_count","leakPointCount","จุดรั่ว"],0)
    },
    updated_at:pick(doc,["updated_at","updatedAt","แก้ไขล่าสุด"],null)
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
