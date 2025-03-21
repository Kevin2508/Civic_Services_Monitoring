import React, { useState, useEffect } from 'react';
import supabase from '../services/supabase';

const CCTVViewer = ({ cameraId }) => {
  const [screenshotUrl, setScreenshotUrl] = useState('');

  useEffect(() => {
    const fetchScreenshot = async () => {
      const { data, error } = await supabase
        .from('screenshots')
        .select('image_url')
        .eq('camera_id', cameraId)
        .order('captured_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching screenshot:', error);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(data.image_url.split('/').pop());

      setScreenshotUrl(urlData.publicUrl);
    };

    fetchScreenshot();
  }, [cameraId]);

  return (
    <div className="cctv-viewer">
      <h3>CCTV Screenshot - Camera {cameraId}</h3>
      {screenshotUrl ? (
        <img src={screenshotUrl} alt="CCTV Screenshot" style={{ width: '100%', borderRadius: '8px' }} />
      ) : (
        <p>Loading screenshot...</p>
      )}
    </div>
  );
};

export default CCTVViewer;