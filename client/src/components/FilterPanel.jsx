import '../styles/FilterPanel.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Accordion from 'react-bootstrap/Accordion';

const groupedCategories = [
  {
    name: 'All',
    items: ['All'],
  },
  {
    name: 'Wine',
    items: ['Red Wine', 'White Wine', 'Rose', 'Sparkling Wine', 'Champagne'],
  },
  {
    name: 'Whiskey',
    items: ['Whiskey', 'Bourbon', 'Scotch'],
  },
  {
    name: 'Brandy',
    items: ['Brandy', 'Cognac'],
  },
  {
    name: 'Beer',
    items: ['Lager', 'Ale', 'Stout', 'Pilsner', 'Cider'], // Add more subcategories as needed
  },
  {
    name: 'Vodka',
    items: ['Vodka'],
  },
  {
    name: 'Tequila',
    items: ['Tequila'],
  },
  {
    name: 'Rum',
    items: ['Rum'],
  },
  {
    name: 'Gin',
    items: ['Gin'],
  },
  {
    name: 'Liqueurs',
    items: ['Liqueurs'],
  },
];

const FilterPanel = ({ categoryFilter, setCategoryFilter }) => {
  return (
    <div className="filter-panel">
      <h2 className="filter-title">Filter by Category</h2>
      <div className="filter-categories">
        <Accordion alwaysOpen={false} className='filterAccordion' >
          {groupedCategories.map((group, idx) =>
            group.items.length === 1 && group.name === group.items[0] ? (
              <button
                key={group.name}
                type="button"
                className={`category-accordion-btn ${categoryFilter === group.name ? 'active' : ''}`}
                onClick={() => setCategoryFilter(group.name)}
              >
                {group.name}
              </button>
            ) : (
              <Accordion.Item eventKey={String(idx)} key={group.name}>
                <Accordion.Header>{group.name}</Accordion.Header>
                <Accordion.Body>
                  <ul style={{ listStyle: 'none', paddingLeft: 0, marginBottom: 0, width: '100%' }}>
                    {group.items.map((cat) => (
                      <li key={cat} className="filter-option">
                        <button
                          type="button"
                          className={`category-sub-btn ${categoryFilter === cat ? 'active' : ''}`}
                          onClick={() => setCategoryFilter(cat)}
                        >
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
            )
          )}
        </Accordion>
      </div>
    </div>
  );
};

export default FilterPanel;
