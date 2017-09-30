using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HomeNinjaApp
{
    public class MockDataStore : IDataStore<Node>
    {
        List<Node> items;

        public MockDataStore()
        {
            items = new List<Node>();
            var mockItems = new List<Node>
            {
                new Node { Topic = Guid.NewGuid().ToString(), Text = "First item", Description="This is an item description." },
                new Node { Topic = Guid.NewGuid().ToString(), Text = "Second item", Description="This is an item description." },
                new Node { Topic = Guid.NewGuid().ToString(), Text = "Third item", Description="This is an item description." },
                new Node { Topic = Guid.NewGuid().ToString(), Text = "Fourth item", Description="This is an item description." },
                new Node { Topic = Guid.NewGuid().ToString(), Text = "Fifth item", Description="This is an item description." },
                new Node { Topic = Guid.NewGuid().ToString(), Text = "Sixth item", Description="This is an item description." },
            };

            foreach (var item in mockItems)
            {
                items.Add(item);
            }
        }

        public async Task<bool> AddItemAsync(Node item)
        {
            items.Add(item);

            return await Task.FromResult(true);
        }

        public async Task<bool> UpdateItemAsync(Node item)
        {
            var _item = items.Where((Node arg) => arg.Topic == item.Topic).FirstOrDefault();
            items.Remove(_item);
            items.Add(item);

            return await Task.FromResult(true);
        }

        public async Task<bool> DeleteItemAsync(string id)
        {
            var _item = items.Where((Node arg) => arg.Topic == id).FirstOrDefault();
            items.Remove(_item);

            return await Task.FromResult(true);
        }

        public async Task<Node> GetItemAsync(string id)
        {
            return await Task.FromResult(items.FirstOrDefault(s => s.Topic == id));
        }

        public async Task<IEnumerable<Node>> GetItemsAsync(bool forceRefresh = false)
        {
            return await Task.FromResult(items);
        }
    }
}
