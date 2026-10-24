using System.ComponentModel.DataAnnotations;

namespace SpendTrack.Api.DTOs
{
    public class CreateTransactionRequest
    {
        [Required, StringLength(200)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime? Date { get; set; }

        [Required]
        public decimal? Amount { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }
    }
}

