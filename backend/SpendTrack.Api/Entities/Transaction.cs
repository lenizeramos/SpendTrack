using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SpendTrack.Api.Entities
{
    public class Transaction
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public string? SourceBank { get; set; }
        public int? ParserVersion { get; set; }
        public bool LowConfidence { get; set; }
        public string? SourceRowHash { get; set; }
    }
}
