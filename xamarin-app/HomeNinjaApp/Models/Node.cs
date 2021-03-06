﻿using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using Newtonsoft.Json;

namespace HomeNinjaApp
{

    public class TempHumState
    {
        //public string Id { get; set; }
        [JsonProperty(PropertyName = "temp")]
        public string Temperature { get; set; }

        [JsonProperty(PropertyName = "hum")]
        public float Humidity { get; set; }

    }
 
    [PropertyChanged.AddINotifyPropertyChangedInterface]
    public class Node
    {
        [JsonProperty(PropertyName = "name")]
        public string Text {
            get;set;
        }

        [JsonProperty(PropertyName = "desc")]
        public string Description { get; set; }

        [JsonProperty(PropertyName = "topic")]
        public string Topic { get; set; }

        [JsonProperty(PropertyName = "features")]
        public string[] Features { get; set; }

        [JsonProperty(PropertyName = "state")]
        public object State { get; set; }

        public bool BoolState { get; set; }
    }
}
