using System;
using Newtonsoft.Json;

namespace HomeNinjaApp
{
    public class SendState
    {
		//public string Id { get; set; }
		[JsonProperty(PropertyName = "topic")]
		public string Topic { get; set; }
		
        [JsonProperty(PropertyName = "state")]
		public string State { get; set; }
    }
}
