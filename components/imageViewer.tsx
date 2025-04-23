import { StyleSheet } from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

type Props = {
  imgSource: ImageSource;
};

export default function ImageViewer({ imgSource }: Props) {
  return <Image source={imgSource} style={styles.image} />;
}

const styles = StyleSheet.create({
  image: {
    // width: 340,
    // height: 440,
    width: wp("80%"),
    borderRadius: 18,
    alignItems: "stretch",
    flex: 1,
  },
});
