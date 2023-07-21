import React,{useState,useEffect} from 'react';
import { StyleSheet, Text, View, Button, TextInput, TouchableOpacity,ActivityIndicator } from "react-native"
import * as Location from 'expo-location';
import SelectDropdown from 'react-native-select-dropdown';
import MapView, { Marker, Polygon } from 'react-native-maps';
import { COLORS, ROUTES, IMGS } from '../../constants';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { PropertyId, ServiceName, ServiceId, UserToken, DataTable } from '../../../store';

export default function GeoFencing({navigation}) {
  const [initialRegion, setInitialRegion] = useState(null);

    const { serviceName } = ServiceName.useState((s) => s);
    const { serviceId } = ServiceId.useState((s) => s);
    // console.warn(serviceId)
    const { userToken } = UserToken.useState((s) => s);
    const [mapRegion, setMapRegion] = useState()
   const [Arrayposition, setArrayposition] = useState(null)
     const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [PolygonCoordsArray, setPolygonCoordsArray] = useState(null);
    const [Loader, setLoader] = useState(false);
    const [loading, setLoading] = useState(false);
    const Status = ["Completed", "Pending", "Ongoing"]
  const [selectedStatus, setSelectedStatus] = useState('');
    useEffect(() => {
  
      async function fetchTrackApiData() {
  
        // console.warn(`Bearer ${userToken}`)
        try {
          const response = await axios.get(
            `https://aagama2.adgrid.in/user/get-task/${serviceId}`,
            {
              headers: {
                'Authorization': 'Bearer ' + userToken
              }
            }
          );

          setSelectedStatus(response.data.task.status);
      setArrayposition(response.data.task.geo_fencing)
      setPolygonCoordsArray(response.data.task.geo_fencing)
      console.warn(response.data.task.geo_fencing)
        if(response.data.task.geo_fencing != null){

          const latitude=response.data.task.geo_fencing[0].latitude
          const longitude=response.data.task.geo_fencing[0].longitude
  
          setInitialRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0005,
            longitudeDelta: 0.0005,
          });
        }
         
        } catch (error) {
          await console.log(error);
          // window.alert("Can't Assign Same Track Name")
        }
      }
      fetchTrackApiData();
    }, [1]);

  const getLocation = async () => {
   
    
     const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission denied');
      return;
    }
if(Arrayposition === null){
  const objLocation=[]
  setLoader(true)
  try {
    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = coords;
   

     if (Arrayposition === null) {
           objLocation.push({
              latitude:coords.latitude,
              longitude:coords.longitude
            })

            setArrayposition(objLocation)
  
            console.log(objLocation,"Initial")
            setLoader(false)
        }
    else {
          
              if ((coords.latitude == Arrayposition[Arrayposition.length - 1].latitude) || (coords.longitude == Arrayposition[Arrayposition.length - 1].longitude)) {
                      console.log(objLocation,"same")
                
                      setLoader(false)
                }
              else if ((coords.latitude != Arrayposition[Arrayposition.length - 1].latitude) || (coords.longitude != Arrayposition[Arrayposition.length - 1].longitude)) {
                          objLocation.push({
                              latitude:coords.latitude,
                              longitude:coords.longitude
                            })
                          console.log(objLocation)
                          setArrayposition(objLocation)
                          setLoader(false)
                }
        }
    setLatitude(coords.latitude)
    setLongitude(coords.longitude)
    console.log(Arrayposition)
    // Use latitude and longitude values as needed
  } catch (error) {
    // Handle error getting location
  }
  
}

else{
  const objLocation=[...Arrayposition]
  setLoader(true)
  try {
    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = coords;
   

     if (Arrayposition.length === 0) {
           objLocation.push({
              latitude:coords.latitude,
              longitude:coords.longitude
            })

            setArrayposition(objLocation)
  
            console.log(objLocation,"Initial")
            setLoader(false)
        }
    else {
          
              if ((coords.latitude == Arrayposition[Arrayposition.length - 1].latitude) || (coords.longitude == Arrayposition[Arrayposition.length - 1].longitude)) {
                      console.log(objLocation,"same")
                
                      setLoader(false)
                }
              else if ((coords.latitude != Arrayposition[Arrayposition.length - 1].latitude) || (coords.longitude != Arrayposition[Arrayposition.length - 1].longitude)) {
                          objLocation.push({
                              latitude:coords.latitude,
                              longitude:coords.longitude
                            })
                          console.log(objLocation,"not same")
                          setArrayposition(objLocation)
                          setLoader(false)
                }
        }
    setLatitude(coords.latitude)
    setLongitude(coords.longitude)
    console.log(Arrayposition)

  } catch (error) {
   
  }
}
  };
  
  
  
  
  async function doneFencing(e) {
    // setLoading(true)
      e.preventDefault();
      setPolygonCoordsArray(Arrayposition)
     
    
      console.log(Arrayposition,serviceId)
      const finalGeofencedObj=[]
      if(Arrayposition != null){
if(Arrayposition.length != 0){
  for(let i=0;i<Arrayposition.length;i++){
    finalGeofencedObj.push({
      "latitude":Arrayposition[i].latitude,
      "longitude":Arrayposition[i].longitude
    })
  }
}
      }
      console.log(finalGeofencedObj);
 
      const formData = new FormData();
      formData.append("status", "Completed");
      if(Arrayposition != null){
        if(Arrayposition.length != 0){
          formData.append("geo_fencing", JSON.stringify(finalGeofencedObj));
        }
      else{
        formData.append("geo_fencing", []);
      }}
     
      formData.append("geo_tagging", []);
      formData.append("images", []);
      formData.append("documents", []);

     console.log(formData)
      try {
        const response = await axios.put(
          `https://aagama2.adgrid.in/user/edit-task/${serviceId}`,
          formData,
          {
            headers: {
              'Authorization': 'Bearer ' + userToken,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        setLoading(false)
        console.log(response);
        
        navigation.navigate(ROUTES.TASKS_DETAIL);
      } catch (error) {
        console.log(error);
      }
  
     
      // navigation.navigate(ROUTES.TASKS_DETAIL);
    }
    const handleStatusChange = (index) => {
      if (index !== 0) {
        setSelectedStatus(index);
        console.log(index)
      }
    };


    function DeletePointFun(index){
console.log(index)
const objDel=[...Arrayposition]
objDel.splice(index,1)
setArrayposition(objDel)
    }
    return (
      <>
       { (loading === true || loading === 'true') ?
        <>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 }}>
              <Ionicons name="ios-arrow-back" size={24} onPress={() => navigation.goBack()} />
              <Text style={{ fontSize: 24, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', fontWeight: 'bold', marginLeft: 10 }}>
              {serviceName}
              </Text>
            </View>
       <View style={styles.loaderContainer}>
       
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
            </>
            :
      <View style={styles.container}>
       
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10,justifyContent:'space-between' }}>
                  <View style={{ display: 'flex', flexDirection: 'row',alignItems: 'center'}}>

                  <Ionicons name="ios-arrow-back" size={24} onPress={() => navigation.goBack()} />
                  <Text style={{ fontSize: 24, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',  fontWeight: 'bold' }}>
                    {serviceName}
                  </Text>
                  </View>
                  <View >
                <SelectDropdown
                  data={Status}
                  defaultButtonText="Select Status"
                  buttonStyle={{ width: 150, backgroundColor: COLORS.primary, borderRadius: 10,height:35 }}
                  buttonTextStyle={{ color: 'white' }}
                  defaultValue={selectedStatus}
                  onSelect={(index) => handleStatusChange(index)}
                  buttonTextAfterSelection={(selectedItem) => selectedItem}
                  rowTextForSelection={(item) => item}
                  disabledItemIndices={[0]}
                />
              </View>
      
      
                </View>
      
      
             
       <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:5,marginBottom:10,marginTop:10}}>
       {
         Loader === false ?
  
  <TouchableOpacity onPress={getLocation} style={{backgroundColor:`${COLORS.primary}`,padding:5,borderRadius:5}}>
  <Text style={{color:'white'}}>
  Capture Location
  </Text>
  </TouchableOpacity>
  :
  <TouchableOpacity  style={{backgroundColor:`${COLORS.primary}`,padding:5,borderRadius:5}}>
  <Text style={{color:'white'}}>
  Loading...
  </Text>
  </TouchableOpacity>
  
       }
       
  <TouchableOpacity onPress={()=>{ navigation.navigate(ROUTES.ENTERLOCATION);}}  style={{backgroundColor:`${COLORS.primary}`,padding:5,borderRadius:5}}>
  <Text style={{color:'white'}}>
  Enter Location
  </Text>
  </TouchableOpacity>
       
        </View>
      
         <View style={{paddingHorizontal:5}}>
         {
          Arrayposition != null &&
  <>
   {Arrayposition.map((marker, index) => (
                <View key={index} style={{flexDirection:'row',alignItems:'center'}}>
                <Text>
                  Point-{`${index+1}`} : {marker.latitude},{marker.longitude}
                </Text>
                <Ionicons name="trash" color="red" size={24} onPress={() => DeletePointFun(index)} />

                    
                </View>
              ))}
  </>
  
         }
        
       </View>
       {
          Arrayposition != null &&
          <>
        <MapView style={styles.map}  initialRegion={initialRegion} >
          
        {
          Arrayposition != null &&
  <> 
  {Arrayposition.map((marker, index) => (
               <Marker
                 key={index}
                 coordinate={{
                   latitude: marker.latitude,
                   longitude: marker.longitude,
                 }}
                 title={`Marker ${index + 1}`}
               />
             ))}
             </>
  }
    
              {
                PolygonCoordsArray != null &&
              <Polygon
            coordinates={PolygonCoordsArray.map((marker) => ({
              latitude: marker.latitude,
              longitude: marker.longitude,
            }))}
            fillColor="red"
            strokeColor="red"
            
          />
              }
        </MapView>
        <View style={{ flexDirection: 'row', display: 'flex', justifyContent: 'flex-end'}}>
          <View></View>
<TouchableOpacity onPress={doneFencing} style={{ backgroundColor:`${COLORS.primary}`,borderRadius:5,marginBottom:80,padding:10,marginTop:10,marginRight:10 }} >
           
          <Text style={{color:'white',textAlign:'center'}}>
          Done
          </Text>
          </TouchableOpacity>
          
        </View>
          </>
  }
 
      </View>
  }
 
      </>
    );
  
  }
 

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  separator: {
    marginVertical: 8,
  },
    loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
   searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    marginRight: 10,
    color:COLORS.primary
  },
  searchButton: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})