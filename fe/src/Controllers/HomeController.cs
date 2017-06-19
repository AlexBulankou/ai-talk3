using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.IO;

namespace src.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Details()
        {
            return View();
        }

        public IActionResult Stock(string id)
        {
            var result = string.Empty;
            HttpWebRequest httpClient = (HttpWebRequest)HttpWebRequest.Create("http://be:8080/stock/?s=" + id);
            using (StreamReader reader = new StreamReader(httpClient.GetResponseAsync().Result.GetResponseStream()))
            {
                result = reader.ReadToEnd();
            }

            if (!string.IsNullOrEmpty(result))
            {
                return Content(result.Substring(4), "application/json");
            }
            else
            {
               return StatusCode(500, "Invalid dependency response");
            }
        }
    }
}
