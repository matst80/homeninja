using System;

namespace HomeNinjaApp
{
    public class ItemDetailViewModel : BaseViewModel
    {
        public Node Item { get; set; }
        public ItemDetailViewModel(Node item = null)
        {
            Title = item?.Text;
            Item = item;
        }
    }
}
