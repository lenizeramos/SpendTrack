using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    [HttpGet("test")]
    public IActionResult Test()
    {
        return Ok("Hello World!");
    }
}