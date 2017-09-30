using System;
using Newtonsoft.Json;

namespace HomeNinjaApp
{
 
    public class Node
    {
        //public string Id { get; set; }
        [JsonProperty(PropertyName = "name")]
        public string Text { get; set; }
        [JsonProperty(PropertyName = "desc")]
        public string Description { get; set; }
        [JsonProperty(PropertyName = "topic")]
        public string Topic { get; set; }
        [JsonProperty(PropertyName = "features")]
        public string[] Features { get; set; }
        public bool BoolState { get; set; }
    }
}
