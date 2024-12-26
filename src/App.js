import { React, useState } from 'react';
import Home from './pages/Home';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Pagination } from 'swiper/modules';
import Eating from './pages/Eating';
import { Shower } from './pages/Shower';
import { Bank } from './pages/Bank';

import 'swiper/css';
import 'swiper/css/pagination';

function App() {
  // const [data, setData] = useState({
  //   eating: processCardData(MOCK_DATA).eatingTransactions,
  //   shower: processCardData(MOCK_DATA).showerTransactions,
  //   bank: processBankData(MOCK_BANK_DATA)
  // });
  const [data, setData] = useState(null);

  return (
    <Swiper
      direction='vertical'
      slidesPerView={1}
      spaceBetween={0}
      style={{ height: '100vh' }}
      modules={[Mousewheel, Pagination]}
      mousewheel={true}
      pagination={{ clickable: true }}
    >
      <SwiperSlide><Home setData = {setData}/></SwiperSlide>
      {data?.eating && <SwiperSlide><Eating data={data.eating} /></SwiperSlide>}
      {data?.shower && <SwiperSlide><Shower data={data.shower} /></SwiperSlide>}
      {data?.bank && <SwiperSlide><Bank data={data.bank} /></SwiperSlide>}
    </Swiper>
  );
}

export default App;
