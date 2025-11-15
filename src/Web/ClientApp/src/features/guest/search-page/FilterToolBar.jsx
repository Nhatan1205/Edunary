import MultipleSelect from '../../../components/drop-down/MultipleSelect';
import RadioSelect from '../../../components/drop-down/RadioSelect';
import { useSearchParams } from 'react-router';

const priceData = [
  { label: "Paid", value: "price-paid" },
  { label: "Free", value: "price-free" },
];

const ratingsData = [
  { label: "4.5 & up", value: "4.5" },
  { label: "4.0 & up", value: "4.0" },
  { label: "3.5 & up", value: "3.5" },
  { label: "3.0 & up", value: "3.0" },
];

const levelsData = [
  { label: "All Levels", value: "all" },
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Expert", value: "expert" },
];

function FilterToolBar() {
  const [searchParams, setSearchParams] = useSearchParams();

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

  const updateQueryParam = (key, selectedItems) => {
    const params = new URLSearchParams(searchParams.toString());

    // xóa các query cũ của key
    params.delete(key);

    if (selectedItems && selectedItems.length > 0) {
      selectedItems.forEach(item => {
        params.append(key, item.value); // append từng item riêng
      });
    }

    setSearchParams(params);
  };

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      padding: '16px',
      flexWrap: 'wrap'
    }}>
      <MultipleSelect
        title="Price"
        data={priceData}
        value={price}
        onChange={selected => updateQueryParam('price', selected)}
      />
      <RadioSelect
        title="Ratings"
        data={ratingsData}
        value={ratings}
        onChange={selected => updateQueryParam('ratings', selected)}
      />
      <MultipleSelect
        title="Level"
        data={levelsData}
        value={levels}
        onChange={selected => updateQueryParam('instructional_level', selected)}
      />
    </div>
  );
}

export default FilterToolBar;
