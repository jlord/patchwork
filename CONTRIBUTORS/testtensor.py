# import TensorFlow
import tensorflow as tf

sess = tf.compat.v1.Session()

# verify we can print a string
hello = tf.constant("Hello from tensorflow")
print(sess.run(hello))

# perform some simple math
a = tf.constant(20)
b = tf.constant(22)
print('a + b = {0}'.format(sess.run(a+b)))
