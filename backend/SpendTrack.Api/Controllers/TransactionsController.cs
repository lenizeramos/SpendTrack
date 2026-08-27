using Microsoft.AspNetCore.Mvc;
using SpendTrack.Api.Services;

namespace SpendTrack.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _service;

        public TransactionsController(ITransactionService service)
        {
            _service = service;
        }
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("Hello World!");
        }

        [HttpPost]
        public async Task<IActionResult> AddTransaction()
        {
            var transaction = await _service.AddTransactionAsync("Hello World");

            return Ok(transaction);
        }
    }
}