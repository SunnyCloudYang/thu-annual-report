import { React, useState } from 'react';
import Home from './pages/Home';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel } from 'swiper/modules';
import Eating from './pages/Eating';
import { Shower } from './pages/Shower';
import { Bank } from './pages/Bank';

// import { MOCK_TX_DATA, MOCK_BANK_DATA, processBankData, processCardData } from './mock';

import 'swiper/css';

function App() {
  // const [data, setData] = useState({
  //   eating: processCardData(MOCK_TX_DATA).eatingTransactions,
  //   shower: processCardData(MOCK_TX_DATA).showerTransactions,
  //   bank: processBankData(MOCK_BANK_DATA)
  // });
  const [data, setData] = useState(null);

  return (
    <Swiper
      direction='vertical'
      slidesPerView={1}
      spaceBetween={0}
      style={{ height: '100vh' }}
      modules={[Mousewheel]}
      mousewheel={true}
    >
      <SwiperSlide><Home setData = {setData}/></SwiperSlide>
      {data?.eating && <SwiperSlide><Eating data={data.eating} /></SwiperSlide>}
      {data?.shower && <SwiperSlide><Shower data={data.shower} /></SwiperSlide>}
      {data?.bank && <SwiperSlide><Bank data={data.bank} /></SwiperSlide>}
    </Swiper>
  );
}

export default App;
