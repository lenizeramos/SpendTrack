using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SpendTrack.Api.Entities
{
    public class Transaction
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
