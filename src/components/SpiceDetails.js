// src/components/SpiceDetails.js
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { fetchSpiceDetails } from '../utils/apiService';

export default function SpiceDetailsScreen({ route }) {
  const { spiceId } = route.params;
  const [spice, setSpice] = useState(null);

  useEffect(() => {
    const getSpiceDetails = async () => {
      const data = await fetchSpiceDetails(spiceId);
      setSpice(data);
    };

    getSpiceDetails();
  }, [spiceId]);

  return (
    <View>
      {spice ? (
        <>
          <Text>{spice.name}</Text>
          <Text>{spice.description}</Text>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
}
