import MultipleSelect from '../../../components/drop-down/MultipleSelect';
import RadioSelect from '../../../components/drop-down/RadioSelect';
import { useSearchParams } from 'react-router';
import DefaultSelect from '../../../components/drop-down/DefaultSelect';

const priceData = [
  { label: "Paid", value: "paid" },
  { label: "Free", value: "free" },
];

const ratingsData = [
  { label: "4.5 & up", value: "4.5" },
  { label: "4.0 & up", value: "4.0" },
  { label: "3.5 & up", value: "3.5" },
  { label: "3.0 & up", value: "3.0" },
];

const levelsData = [
  { label: "Beginner", value: "0" },
  { label: "Intermediate", value: "1" },
  { label: "Advanced", value: "2" },
  { label: "All Levels", value: "3" },
];

const publishDateData = [
  { label: "Past Week", value: "in_last_week" },
  { label: "Past Month", value: "in_last_month" },
  { label: "Past Three Months", value: "in_last_3months" },
  { label: "Past Year", value: "in_last_year" },
];

const sortData = [
  { label: "Most Relevant", value: "relevant" },
  { label: "Most Recent", value: "newest" },
  { label: "Number of Students", value: "num_students" },
  { label: "Highest Rated", value: "highest_rated" },
];

function FilterToolBar({categoryData}) {
  const [searchParams, setSearchParams] = useSearchParams();
  //convert category
  const categories = categoryData?.items?.map(cat => ({
    label: cat.title,
    value: cat.id.toString(),
  })) || [];


  // derive value trực tiếp từ URL
  const price = searchParams.getAll("price")
    .map(val => priceData.find(item => item.value === val))
    .filter(Boolean);

  const ratings = searchParams.getAll("ratings")
    .map(val => ratingsData.find(item => item.value === val))
    .filter(Boolean);

  const levels = searchParams.getAll("instructional_level")
    .map(val => levelsData.find(item => item.value === val))
    .filter(Boolean);

  const publishDate = searchParams.getAll("time")
    .map(val => publishDateData.find(item => item.value === val))
    .filter(Boolean);

  const selectedCategories = searchParams.getAll("category")
    .map(val => categories.find(item => item.value === val))
    .filter(Boolean);
  
  const sortby = searchParams.getAll("sort")
    .map(val => sortData.find(item => item.value === val))
    .filter(Boolean);

  const updateQueryParam = (key, selectedItems) => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete(key);

    if (selectedItems && selectedItems.length > 0) {
      selectedItems.forEach(item => {
        params.append(key, item.value);
      });
    }

    setSearchParams(params);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <RadioSelect
          title="Price"
          data={priceData}
          value={price}
          onChange={selected => updateQueryParam('price', selected)}
          defaultLabel='Any Price'
        />
        <RadioSelect
          title="Ratings"
          data={ratingsData}
          value={ratings}
          onChange={selected => updateQueryParam('ratings', selected)}
          defaultLabel='Any Rating'
        />
        <MultipleSelect
          title="Level"
          data={levelsData}
          value={levels}
          onChange={selected => updateQueryParam('instructional_level', selected)}
        />
        <RadioSelect
          title="Publish Date"
          data={publishDateData}
          value={publishDate}
          onChange={selected => updateQueryParam('time', selected)}
          defaultLabel='All Time'
        />
        <MultipleSelect
          title="Category"
          data={categories}
          value={selectedCategories}
          onChange={selected => updateQueryParam('category', selected)}
        />
      </div>

      <DefaultSelect
        data={sortData}
        value={sortby}
        onChange={selected => updateQueryParam('sort', selected)}
        defaultLabel="relevant"
      />
    </div>
  );
}

export default FilterToolBar;
