import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Mousewheel, Parallax } from 'swiper/modules';
import './style.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/parallax';

export interface IPopupSliderProps {
  listName: string;
  siteURL: string;
  maxPopupShows: number;
}

const PopupSlider: React.FC<IPopupSliderProps> = ({ listName, siteURL, maxPopupShows }) => {
  const [popupData, setPopupData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const fetchPopupData = async () => {
    try {
      const apiUrl = `${siteURL}/_api/web/lists/getbytitle('${listName}')/items?$select=Heading,HeadingURL,Description&$expand=AttachmentFiles`;
      
      const response = await fetch(apiUrl, {
        headers: {
          "Accept": "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "odata-version": "",
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
   
      const data = await response.json();
      const items = data.d.results;

      // Process items to add the full image URL if available
      const itemsWithImages = items.map((item: any) => {
        const imageUrl = item.AttachmentFiles.results.length > 0 ? `${item.AttachmentFiles.results[0].ServerRelativeUrl}` : null;
        return { ...item, imageUrl };
      });
  
      setPopupData(itemsWithImages);
    } catch (error) {
      setError("Error fetching popup data");
      console.error("Error fetching data:", error);
    }
  };
  
  useEffect(() => {
    if (listName && siteURL) {
      fetchPopupData();
    }

    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem("lastVisit");
    let popupCount = parseInt(localStorage.getItem("popupCount") || "0");

    // Reset the count if it's a new day
    if (lastVisit !== today) {
      localStorage.setItem("lastVisit", today);
      popupCount = 0;
      localStorage.setItem("popupCount", "0");
    }

    // Show the modal if popupCount is less than maxPopupShows
    if (popupCount < maxPopupShows) {
      setIsModalOpen(true);
      localStorage.setItem("popupCount", (popupCount + 1).toString());
    }
  }, [listName, siteURL, maxPopupShows]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOutsideClick = (event: React.MouseEvent) => {
    if (modalRef.current && event.target === modalRef.current) {
      closeModal();
    }
  };

  return (
    <div> 
      {error && <div className="error">{error}</div>}

      {isModalOpen && (
        <div
          id="popupModal"
          className="modalMain"
          ref={modalRef}
          onClick={handleOutsideClick}
        >
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <Swiper 
              spaceBetween={10} 
              slidesPerView={1}
              loop={true}
              mousewheel={true}
              parallax={true}
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              modules={[Pagination, Autoplay, Mousewheel, Parallax]}
              speed={1500}
            >
              {popupData.map((item, index) => (
                <SwiperSlide className="slideItem" key={index}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="Popup Image" />
                  ) : (
                    <div>No image available</div>
                  )}
                  <div>
                    <a href={item.HeadingURL} target="_blank" rel="noopener noreferrer">
                      {item.Heading}
                    </a>
                    <p>{item.Description}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            {/* Custom pagination container below the Swiper */}
            <div className="swiper-pagination-custom"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupSlider;
