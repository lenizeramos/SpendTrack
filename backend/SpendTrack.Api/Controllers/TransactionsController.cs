using Microsoft.AspNetCore.Mvc;
using SpendTrack.Api.Services;
using SpendTrack.Api.DTOs;
using SpendTrack.Api.Entities;

namespace SpendTrack.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _service;
        private readonly ICsvParsingService _csvParser;

        public TransactionsController(ITransactionService service, ICsvParsingService csvParser)
        {
            _service = service;
            _csvParser = csvParser;
        }
        [HttpGet]
        public async Task<ActionResult<PagedResult<Transaction>>> GetAll([FromQuery] TransactionQueryParameters query)
        {
            var transactions = await _service.GetAllAsync(query);

            return Ok(transactions);
        }

        [HttpPost]
        public async Task<IActionResult> AddTransaction([FromBody] CreateTransactionRequest request)
        {
            var transaction = await _service.AddTransactionAsync(request);

            return Ok(transaction);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadCsv(IFormFile file, [FromForm] bool confirmImport = false, [FromForm] List<int>? excludedIndexes = null)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            try
            {
                using var stream = file.OpenReadStream();

                var parseResult = _csvParser.ParseBankCsv(stream);
                var transactions = parseResult.Transactions;

                if (transactions.Count == 0)
                    return BadRequest("The CSV file contains no transactions.");

                var result = await _service.ImportTransactionsAsync(transactions, confirmImport, excludedIndexes);

                if (result.RequiresConfirmation)
                    return Conflict(result);

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    Message = ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    Message = "Failed to import CSV."
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransaction(string id, [FromBody] UpdateTransactionRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Description))
                return BadRequest(new { Message = "Description is required." });

            var updated = await _service.UpdateTransactionAsync(
                id,
                request.Description.Trim());

            if (updated is null)
                return NotFound(new { Message = "Transaction not found." });

            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(string id)
        {
            var deleted = await _service.DeleteTransactionAsync(id);

            if (!deleted)
                return NotFound(new { Message = "Transaction not found." });

            return NoContent();
        }
    }
}
