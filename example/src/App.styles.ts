import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitleText: {
    fontSize: 18,
  },
  statusText: {
    fontSize: 18,
    marginTop: 12,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  button: {
    margin: 12,
    backgroundColor: '#000',
    color: '#ffff',
    padding: 12,
    borderRadius: 8,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});

export default styles;
