using System;
using System.Collections.Generic;
using System.Linq;
using HomeNinjaApp.NodeViews;

namespace HomeNinjaApp.ViewLoader
{
    public class NodeViewHelper
    {
        public Dictionary<string[], Type> NodeViews = new Dictionary<string[], Type>(); 

        public NodeViewHelper()
        {
            var nodeType = typeof(INodeView);
            var types = this.GetType().Assembly.GetExportedTypes();
            foreach(var t in types) {
                if (t.IsAssignableFrom(nodeType)) {
                    var attr = t.GetCustomAttributes(typeof(ViewForFeatureAttribute), true).OfType<ViewForFeatureAttribute>().FirstOrDefault();
                    if (attr!=null) {
                        NodeViews.Add(attr.Features,t);
                    }
                }
            }
        }

        public Xamarin.Forms.View GetViewForNode(Node node) {
            var viewType = NodeViews.FirstOrDefault(d => d.Key.Contains(node.Features.FirstOrDefault()));
            if (viewType.Value != null)
                return Activator.CreateInstance(viewType.Value) as Xamarin.Forms.View;
            return new OnOff();
        }

        private static NodeViewHelper _instance;

        public static NodeViewHelper Instance
        {
            get
            {
                return _instance ?? (_instance = new NodeViewHelper());
            }
        }


    }
}
