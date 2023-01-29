public class ConcatenateStrings {
    public static void main(String[] args) {
        if (args.length < 2) {
            System.out.println("Please provide two strings to concatenate");
            return;
        }

        String result = args[0] + " " + args[1];

        System.out.println("The concatenated string is: " + result);
    }
}