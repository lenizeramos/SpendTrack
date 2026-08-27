using MongoDB.Driver;
using SpendTrack.Api.Entities;

namespace SpendTrack.Api.Data
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(IConfiguration config)
        {
            var client = new MongoClient(config["MongoDB:ConnectionString"]);
            _database = client.GetDatabase(config["MongoDB:DatabaseName"]);
        }

        public IMongoCollection<Transaction> Transactions =>
            _database.GetCollection<Transaction>("transactions");
    }
}

