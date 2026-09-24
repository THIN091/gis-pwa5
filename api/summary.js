const {getCollection}=require("../lib/mongodb");const {setCors,handleOptions,requireApiKey,parseYear,parseQuarter,normalizeDoc,buildPeriodFilter,addBranchFilter}=require("../lib/api");
const n=v=>Number.isFinite(Number(v))?Number(v):0;
module.exports=async function(req,res){setCors(res);if(handleOptions(req,res))return;if(req.method!=="GET")return res.status(405).json({ok:false,error:"Method not allowed"});if(!requireApiKey(req,res))return;
try{const year=parseYear(req.query.year),quarter=parseQuarter(req.query.quarter),branch=req.query.branch||null,branchCode=req.query.branchCode||null;let f=addBranchFilter(buildPeriodFilter(year,quarter),branch,branchCode);
const rows=(await (await getCollection()).find(f).limit(5000).toArray()).map(normalizeDoc);const totals=rows.reduce((a,r)=>{for(const k of Object.keys(a))a[k]+=n(r.metrics[k]);return a},{customer_count:0,imported_customer_count:0,pipe_length_m:0,valve_count:0,fire_hydrant_count:0,leak_point_count:0});
res.status(200).json({ok:true,filters:{year,quarter,branch,branchCode},branch_count:new Set(rows.map(r=>r.branch.code||r.branch.name).filter(Boolean)).size,document_count:rows.length,totals,completion_percentage:totals.customer_count?(totals.imported_customer_count/totals.customer_count)*100:null})}
catch(e){console.error(e);res.status(500).json({ok:false,error:e.message})}};
