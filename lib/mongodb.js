const { MongoClient, ServerApiVersion } = require("mongodb");
let clientPromise;
function getClientPromise(){
  if(!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured");
  if(!clientPromise){
    const client=new MongoClient(process.env.MONGODB_URI,{
      serverApi:{version:ServerApiVersion.v1,strict:true,deprecationErrors:true},
      maxPoolSize:10
    });
    clientPromise=client.connect();
  }
  return clientPromise;
}
async function getCollection(){
  const client=await getClientPromise();
  const db=process.env.MONGODB_DB, collection=process.env.MONGODB_COLLECTION;
  if(!db||!collection) throw new Error("MONGODB_DB and MONGODB_COLLECTION are required");
  return client.db(db).collection(collection);
}
module.exports={getCollection};
